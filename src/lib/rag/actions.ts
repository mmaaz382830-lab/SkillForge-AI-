"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  DEFAULT_GEMINI_EMBEDDING_MODEL,
  GEMINI_EMBEDDING_DIMENSION,
} from "@/lib/ai/constants";
import {
  AiConfigurationError,
  AiProviderError,
  AiUsageLimitError,
  getSafeAiErrorMessage,
} from "@/lib/ai/errors";
import { assertAiUsageAllowed, logAiUsageEvent } from "@/lib/ai/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MaterialActionResult } from "@/types/materials";

import {
  generateGroundedAnswer,
  RAG_INSUFFICIENT_CONTEXT_MESSAGE,
  type RagSourceSnippet,
} from "./answer";
import { chunkMaterialText } from "./chunking";
import {
  formatEmbeddingForPgvector,
  generateGeminiEmbeddings,
} from "./embeddings";
import {
  countOwnedMaterialChunks,
  getAuthenticatedRagUserId,
  getOwnedChatSession,
  getOwnedCompletedMaterialForRag,
  getChatSessionMessages,
  getChunksByIds,
  renameChatSession,
  type ChatMessage,
  type ChatMessageView,
  type ChatSessionListItem,
} from "./queries";
import { retrieveMaterialChunks } from "./retrieval";

type IndexedMaterialResult = {
  material_id: string;
  chunk_count: number;
  embedding_model: string;
  embedding_dimension: number;
};

type AnswerQuestionFromMaterialInput = {
  materialId: string;
  question: string;
  topK?: number;
};

type RagAnswerResult = {
  material_id: string;
  answer: string;
  sources: RagSourceSnippet[];
  source_chunk_ids: string[];
  insufficient_context: boolean;
};

type CreateChatSessionInput = {
  materialId?: string | null;
  title?: string | null;
};

type AskRagChatQuestionInput = {
  sessionId: string;
  /** null / empty = "all prepared materials" mode */
  materialId: string | null;
  question: string;
  topK?: number;
};

type AskRagChatQuestionResult = RagAnswerResult & {
  session_id: string;
  user_message_id: string;
  assistant_message_id: string;
};

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

type MaterialChunkInsert = {
  material_id: string;
  user_id: string;
  chunk_index: number;
  content: string;
  character_count: number;
  token_count: number | null;
  embedding: string;
  metadata: Record<string, string | number | boolean | null>;
};

function getErrorObject(error: unknown): SupabaseLikeError | null {
  return error && typeof error === "object" ? (error as SupabaseLikeError) : null;
}

function logMaterialIndexingError(input: {
  step: "auth" | "load-material" | "chunk" | "embedding" | "delete-old" | "insert" | "update-count" | "unexpected";
  materialId?: string;
  userId?: string;
  error?: unknown;
}) {
  const error = getErrorObject(input.error);

  console.error("[rag:index-material:error]", {
    step: input.step,
    materialId: input.materialId,
    userId: input.userId,
    code: error?.code,
    message: error?.message ?? (input.error ? "Unknown error" : undefined),
    details: error?.details,
    hint: error?.hint,
  });
}

function getEmbeddingErrorCode(error: unknown): string {
  if (error instanceof AiProviderError) {
    return `AI_PROVIDER_${error.code.toUpperCase()}`;
  }

  if (error instanceof AiConfigurationError) {
    return "AI_CONFIGURATION_UNAVAILABLE";
  }

  return "MATERIAL_INDEXING_FAILED";
}

function revalidateMaterialViews(materialId: string) {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.chat);
  revalidatePath(dashboardRoutes.materials);
  revalidatePath(dashboardRoutes.materialDetail(materialId));
}

export async function indexMaterialForRag(
  materialId: string,
): Promise<MaterialActionResult<IndexedMaterialResult>> {
  const id = materialId.trim();

  if (!id) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    logMaterialIndexingError({
      step: "auth",
      materialId: id,
      error: new Error(user.error),
    });
    return user;
  }

  const material = await getOwnedCompletedMaterialForRag({
    materialId: id,
    userId: user.data,
  });

  if (!material.ok) {
    logMaterialIndexingError({
      step: "load-material",
      materialId: id,
      userId: user.data,
      error: new Error(material.error),
    });
    return material;
  }

  const chunks = chunkMaterialText(material.data.extracted_text ?? "");

  if (chunks.length === 0) {
    logMaterialIndexingError({
      step: "chunk",
      materialId: id,
      userId: user.data,
      error: new Error("No chunks were produced."),
    });
    return {
      ok: false,
      error: "This material does not have enough text to index.",
    };
  }

  const startedAt = Date.now();
  let embeddings;

  try {
    embeddings = await generateGeminiEmbeddings(
      chunks.map((chunk) => chunk.content),
      { model: DEFAULT_GEMINI_EMBEDDING_MODEL },
    );
  } catch (error) {
    const errorCode = getEmbeddingErrorCode(error);
    logMaterialIndexingError({
      step: "embedding",
      materialId: id,
      userId: user.data,
      error,
    });
    await logAiUsageEvent({
      userId: user.data,
      featureType: "embeddings",
      status: "error",
      model: DEFAULT_GEMINI_EMBEDDING_MODEL,
      errorCode,
      metadata: {
        material_id: id,
        requested_count: chunks.length,
        duration_ms: Date.now() - startedAt,
        error_code: errorCode,
      },
    });

    return {
      ok: false,
      error: getSafeAiErrorMessage(error),
    };
  }

  const rows: MaterialChunkInsert[] = chunks.map((chunk, index) => ({
    material_id: id,
    user_id: user.data,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    character_count: chunk.character_count,
    token_count: chunk.token_count,
    embedding: formatEmbeddingForPgvector(embeddings[index]?.values ?? []),
    metadata: {
      ...chunk.metadata,
      embedding_model: embeddings[index]?.model ?? DEFAULT_GEMINI_EMBEDDING_MODEL,
      embedding_dimension: GEMINI_EMBEDDING_DIMENSION,
    },
  }));

  const supabase = await createSupabaseServerClient();
  const { error: deleteError } = await supabase
    .from("material_chunks")
    .delete()
    .eq("material_id", id)
    .eq("user_id", user.data);

  if (deleteError) {
    logMaterialIndexingError({
      step: "delete-old",
      materialId: id,
      userId: user.data,
      error: deleteError,
    });
    return {
      ok: false,
      error: "Could not index material. Please try again.",
    };
  }

  const { error: insertError } = await supabase.from("material_chunks").insert(rows);

  if (insertError) {
    logMaterialIndexingError({
      step: "insert",
      materialId: id,
      userId: user.data,
      error: insertError,
    });
    await logAiUsageEvent({
      userId: user.data,
      featureType: "embeddings",
      status: "error",
      model: DEFAULT_GEMINI_EMBEDDING_MODEL,
      errorCode: "MATERIAL_CHUNK_SAVE_FAILED",
      metadata: {
        material_id: id,
        requested_count: chunks.length,
        duration_ms: Date.now() - startedAt,
        error_code: "MATERIAL_CHUNK_SAVE_FAILED",
      },
    });
    return {
      ok: false,
      error: "Could not index material. Please try again.",
    };
  }

  const { error: updateError } = await supabase
    .from("materials")
    .update({ chunk_count: rows.length })
    .eq("id", id)
    .eq("user_id", user.data)
    .is("deleted_at", null);

  if (updateError) {
    logMaterialIndexingError({
      step: "update-count",
      materialId: id,
      userId: user.data,
      error: updateError,
    });
    return {
      ok: false,
      error: "Material was indexed, but the chunk count could not be updated.",
    };
  }

  await logAiUsageEvent({
    userId: user.data,
    featureType: "embeddings",
    status: "success",
    model: DEFAULT_GEMINI_EMBEDDING_MODEL,
    metadata: {
      material_id: id,
      requested_count: rows.length,
      duration_ms: Date.now() - startedAt,
    },
  });

  revalidateMaterialViews(id);

  return {
    ok: true,
    data: {
      material_id: id,
      chunk_count: rows.length,
      embedding_model: DEFAULT_GEMINI_EMBEDDING_MODEL,
      embedding_dimension: GEMINI_EMBEDDING_DIMENSION,
    },
  };
}


function getRagAnswerErrorCode(error: unknown): string {
  if (error instanceof AiProviderError) {
    return `AI_PROVIDER_${error.code.toUpperCase()}`;
  }

  if (error instanceof AiConfigurationError) {
    return "AI_CONFIGURATION_UNAVAILABLE";
  }

  return "RAG_ANSWER_FAILED";
}

function logRagAnswerError(input: {
  step: "auth" | "load-material" | "indexed-chunks" | "usage" | "retrieval" | "answer";
  materialId?: string;
  userId?: string;
  error?: unknown;
}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const error = getErrorObject(input.error);

  console.error("[rag:answer:error]", {
    step: input.step,
    materialId: input.materialId,
    userId: input.userId,
    code: error?.code,
    message: error?.message ?? (input.error ? "Unknown error" : undefined),
    details: error?.details,
    hint: error?.hint,
  });
}

function logRagRetrievalDiagnostic(input: {
  mode: "all" | "material";
  materialId?: string | null;
  requestedCount?: number | null;
  chunkCount: number;
}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[rag:retrieval]", {
    mode: input.mode,
    materialId: input.materialId ?? null,
    requestedCount: input.requestedCount ?? null,
    chunkCount: input.chunkCount,
  });
}
function normalizeTopK(topK: number | undefined): number | undefined {
  if (topK === undefined) {
    return undefined;
  }

  return Math.max(1, Math.min(Math.trunc(topK), 20));
}

export async function answerQuestionFromMaterial(
  input: AnswerQuestionFromMaterialInput,
): Promise<MaterialActionResult<RagAnswerResult>> {
  const materialId = input.materialId.trim();
  const question = input.question.trim();
  const requestedCount = normalizeTopK(input.topK);
  const startedAt = Date.now();

  if (!materialId) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  if (!question) {
    return {
      ok: false,
      error: "Please enter a question first.",
    };
  }

  if (question.length > 2_000) {
    return {
      ok: false,
      error: "Question is too long. Please ask a shorter question.",
    };
  }

  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    logRagAnswerError({
      step: "auth",
      materialId,
      error: new Error(user.error),
    });
    return user;
  }

  const material = await getOwnedCompletedMaterialForRag({
    materialId,
    userId: user.data,
  });

  if (!material.ok) {
    logRagAnswerError({
      step: "load-material",
      materialId,
      userId: user.data,
      error: new Error(material.error),
    });
    return material;
  }

  if ((material.data.chunk_count ?? 0) <= 0) {
    const chunkCount = await countOwnedMaterialChunks({
      materialId,
      userId: user.data,
    });

    if (!chunkCount.ok) {
      logRagAnswerError({
        step: "indexed-chunks",
        materialId,
        userId: user.data,
        error: new Error(chunkCount.error),
      });
      return chunkCount;
    }

    if (chunkCount.data <= 0) {
      return {
        ok: false,
        error: "This material has not been indexed for AI chat yet.",
      };
    }
  }

  try {
    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "chat",
      metadata: {
        material_id: materialId,
        requested_count: requestedCount ?? null,
      },
    });

    const chunks = await retrieveMaterialChunks({
      question,
      materialId,
      topK: requestedCount ?? 12,
    });

    logRagRetrievalDiagnostic({
      mode: "material",
      materialId,
      requestedCount: requestedCount ?? 12,
      chunkCount: chunks.length,
    });

    if (chunks.length === 0) {
      return {
        ok: true,
        data: {
          material_id: materialId,
          answer: RAG_INSUFFICIENT_CONTEXT_MESSAGE,
          sources: [],
          source_chunk_ids: [],
          insufficient_context: true,
        },
      };
    }

    const grounded = await generateGroundedAnswer({ question, chunks });

    await logAiUsageEvent({
      userId: user.data,
      featureType: "chat",
      status: "success",
      provider: grounded.provider ?? "gemini",
      model: grounded.model,
      metadata: {
        material_id: materialId,
        requested_count: requestedCount ?? chunks.length,
        chunk_count: chunks.length,
        duration_ms: Date.now() - startedAt,
        retry_count: grounded.retry_count,
      },
    });

    return {
      ok: true,
      data: {
        material_id: materialId,
        answer: grounded.answer,
        sources: grounded.sources,
        source_chunk_ids: grounded.source_chunk_ids,
        insufficient_context: grounded.insufficient_context,
      },
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      logRagAnswerError({
        step: "usage",
        materialId,
        userId: user.data,
        error,
      });
      return {
        ok: false,
        error: error.safeMessage,
      };
    }

    const errorCode = getRagAnswerErrorCode(error);
    logRagAnswerError({
      step: error instanceof AiProviderError || error instanceof AiConfigurationError ? "answer" : "retrieval",
      materialId,
      userId: user.data,
      error,
    });
    await logAiUsageEvent({
      userId: user.data,
      featureType: "chat",
      status: "error",
      model: null,
      errorCode,
      metadata: {
        material_id: materialId,
        requested_count: requestedCount ?? null,
        duration_ms: Date.now() - startedAt,
        error_code: errorCode,
      },
    });

    return {
      ok: false,
      error: getSafeAiErrorMessage(error),
    };
  }
}

/**
 * All-materials mode: retrieve chunks across every material the user owns
 * (filter_material_id = null in the RPC). Security is enforced server-side
 * by auth.uid() inside match_material_chunks. topK is raised to 16 for
 * broad overview questions.
 */
async function answerQuestionAllMaterials(input: {
  question: string;
  topK?: number;
  userId: string;
}): Promise<MaterialActionResult<RagAnswerResult>> {
  const question = input.question.trim();
  const startedAt = Date.now();

  try {
    await assertAiUsageAllowed({
      userId: input.userId,
      featureType: "chat",
      metadata: { material_id: "__all__", requested_count: input.topK ?? null },
    });

    const chunks = await retrieveMaterialChunks({
      question,
      materialId: null,
      topK: input.topK ?? 16,
    });

    logRagRetrievalDiagnostic({
      mode: "all",
      materialId: null,
      requestedCount: input.topK ?? 16,
      chunkCount: chunks.length,
    });

    if (chunks.length === 0) {
      return {
        ok: true,
        data: {
          material_id: "__all__",
          answer: RAG_INSUFFICIENT_CONTEXT_MESSAGE,
          sources: [],
          source_chunk_ids: [],
          insufficient_context: true,
        },
      };
    }

    const grounded = await generateGroundedAnswer({ question, chunks });

    await logAiUsageEvent({
      userId: input.userId,
      featureType: "chat",
      status: "success",
      provider: grounded.provider ?? "gemini",
      model: grounded.model,
      metadata: {
        material_id: "__all__",
        requested_count: input.topK ?? chunks.length,
        chunk_count: chunks.length,
        duration_ms: Date.now() - startedAt,
        retry_count: grounded.retry_count,
      },
    });

    return {
      ok: true,
      data: {
        material_id: "__all__",
        answer: grounded.answer,
        sources: grounded.sources,
        source_chunk_ids: grounded.source_chunk_ids,
        insufficient_context: grounded.insufficient_context,
      },
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return { ok: false, error: error.safeMessage };
    }
    const errorCode = getRagAnswerErrorCode(error);
    logRagAnswerError({
      step:
        error instanceof AiProviderError || error instanceof AiConfigurationError
          ? "answer"
          : "retrieval",
      materialId: "__all__",
      userId: input.userId,
      error,
    });
    await logAiUsageEvent({
      userId: input.userId,
      featureType: "chat",
      status: "error",
      model: null,
      errorCode,
      metadata: {
        material_id: "__all__",
        requested_count: input.topK ?? null,
        duration_ms: Date.now() - startedAt,
        error_code: errorCode,
      },
    });
    return { ok: false, error: getSafeAiErrorMessage(error) };
  }
}


type ChatMessageMetadata = Record<string, string | number | boolean | null>;

type SavedChatMessage = Pick<
  ChatMessage,
  "id" | "chat_session_id" | "role" | "content" | "source_chunk_ids" | "metadata" | "created_at"
>;

function normalizeChatTitle(title: string | null | undefined): string {
  const trimmed = title?.replace(/\s+/g, " ").trim();

  if (!trimmed) {
    return "New note chat";
  }

  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
}

function normalizeRequiredId(value: string): string {
  return value.trim();
}

function revalidateChatViews(materialId?: string | null) {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.chat);

  if (materialId) {
    revalidatePath(dashboardRoutes.materialDetail(materialId));
  }
}

function logChatPersistenceError(input: {
  step:
    | "auth"
    | "material"
    | "session"
    | "create-session"
    | "save-message"
    | "touch-session"
    | "soft-delete"
    | "answer";
  sessionId?: string;
  materialId?: string;
  userId?: string;
  error?: unknown;
}) {
  const error = getErrorObject(input.error);

  console.error("[rag:chat:error]", {
    step: input.step,
    sessionId: input.sessionId,
    materialId: input.materialId,
    userId: input.userId,
    code: error?.code,
    message: error?.message ?? (input.error ? "Unknown error" : undefined),
    details: error?.details,
    hint: error?.hint,
  });
}

async function touchChatSession(input: {
  sessionId: string;
  userId: string;
}): Promise<MaterialActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    logChatPersistenceError({
      step: "touch-session",
      sessionId: input.sessionId,
      userId: input.userId,
      error,
    });
    return {
      ok: false,
      error: "Could not update chat session.",
    };
  }

  return {
    ok: true,
    data: { id: input.sessionId },
  };
}

async function saveChatMessagePair(input: {
  sessionId: string;
  userId: string;
  question: string;
  answer: string;
  sourceChunkIds?: string[] | null;
  userMetadata?: ChatMessageMetadata;
  assistantMetadata?: ChatMessageMetadata;
}): Promise<MaterialActionResult<{ userMessage: SavedChatMessage; assistantMessage: SavedChatMessage }>> {
  const supabase = await createSupabaseServerClient();
  const now = Date.now();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert([
      {
        chat_session_id: input.sessionId,
        user_id: input.userId,
        role: "user",
        content: input.question,
        source_chunk_ids: null,
        metadata: input.userMetadata ?? {},
        created_at: new Date(now).toISOString(),
      },
      {
        chat_session_id: input.sessionId,
        user_id: input.userId,
        role: "assistant",
        content: input.answer,
        source_chunk_ids: input.sourceChunkIds ?? null,
        metadata: input.assistantMetadata ?? {},
        created_at: new Date(now + 1).toISOString(),
      },
    ])
    .select(
      "id,chat_session_id,role,content,source_chunk_ids,metadata,created_at",
    )
    .returns<SavedChatMessage[]>();

  if (error || !data || data.length !== 2) {
    logChatPersistenceError({
      step: "save-message",
      sessionId: input.sessionId,
      userId: input.userId,
      error,
    });
    return {
      ok: false,
      error: "Could not save chat message.",
    };
  }

  const userMessage = data.find((message) => message.role === "user");
  const assistantMessage = data.find((message) => message.role === "assistant");

  if (!userMessage || !assistantMessage) {
    logChatPersistenceError({
      step: "save-message",
      sessionId: input.sessionId,
      userId: input.userId,
      error: new Error("Inserted chat message pair was incomplete."),
    });
    return {
      ok: false,
      error: "Could not save chat message.",
    };
  }

  const touched = await touchChatSession({
    sessionId: input.sessionId,
    userId: input.userId,
  });

  if (!touched.ok) {
    return touched;
  }

  return {
    ok: true,
    data: { userMessage, assistantMessage },
  };
}
export async function createChatSession(
  input: CreateChatSessionInput,
): Promise<MaterialActionResult<ChatSessionListItem>> {
  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    logChatPersistenceError({
      step: "auth",
      error: new Error(user.error),
    });
    return user;
  }

  const materialId = input.materialId?.trim() || null;

  if (materialId) {
    const material = await getOwnedCompletedMaterialForRag({
      materialId,
      userId: user.data,
    });

    if (!material.ok) {
      logChatPersistenceError({
        step: "material",
        materialId,
        userId: user.data,
        error: new Error(material.error),
      });
      return material;
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.data,
      material_id: materialId,
      title: normalizeChatTitle(input.title),
    })
    .select("id,material_id,title,created_at,updated_at")
    .maybeSingle<ChatSessionListItem>();

  if (error || !data) {
    logChatPersistenceError({
      step: "create-session",
      materialId: materialId ?? undefined,
      userId: user.data,
      error,
    });
    return {
      ok: false,
      error: "Could not create chat session.",
    };
  }

  revalidateChatViews(materialId);

  return {
    ok: true,
    data,
  };
}

export async function softDeleteChatSession(
  sessionId: string,
): Promise<MaterialActionResult<{ id: string }>> {
  const id = normalizeRequiredId(sessionId);

  if (!id) {
    return {
      ok: false,
      error: "Chat session not found.",
    };
  }

  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.data)
    .is("deleted_at", null);

  if (error) {
    logChatPersistenceError({
      step: "soft-delete",
      sessionId: id,
      userId: user.data,
      error,
    });
    return {
      ok: false,
      error: "Could not delete chat session.",
    };
  }

  revalidateChatViews();

  return {
    ok: true,
    data: { id },
  };
}

export async function askRagChatQuestion(
  input: AskRagChatQuestionInput,
): Promise<MaterialActionResult<AskRagChatQuestionResult>> {
  const sessionId = normalizeRequiredId(input.sessionId);
  // null / empty string = "all prepared materials" mode
  const rawMaterialId = input.materialId?.trim() || null;
  const isAllMaterials = !rawMaterialId;
  const question = input.question.trim();
  // Raise topK for broad all-materials queries (capped by normalizeTopK at 20)
  const topK = normalizeTopK(input.topK ?? (isAllMaterials ? 16 : 12));

  if (!sessionId) {
    return { ok: false, error: "Chat session not found." };
  }

  if (!question) {
    return { ok: false, error: "Please enter a question first." };
  }

  if (question.length > 2_000) {
    return { ok: false, error: "Question is too long. Please ask a shorter question." };
  }

  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    logChatPersistenceError({
      step: "auth",
      sessionId,
      materialId: rawMaterialId ?? undefined,
      error: new Error(user.error),
    });
    return user;
  }

  const session = await getOwnedChatSession({ sessionId, userId: user.data });

  if (!session.ok) {
    logChatPersistenceError({
      step: "session",
      sessionId,
      materialId: rawMaterialId ?? undefined,
      userId: user.data,
      error: new Error(session.error),
    });
    return session;
  }

  // Single-material mode: enforce that the session is bound to the same material
  if (!isAllMaterials && session.data.material_id && session.data.material_id !== rawMaterialId) {
    return { ok: false, error: "This chat session is linked to a different material." };
  }

  // All-materials mode: enforce that the session is not bound to a specific material
  if (isAllMaterials && session.data.material_id !== null) {
    return { ok: false, error: "This chat session is linked to a specific material." };
  }

  // Single-material mode: validate material exists and is completed
  if (!isAllMaterials && rawMaterialId) {
    const material = await getOwnedCompletedMaterialForRag({
      materialId: rawMaterialId,
      userId: user.data,
    });
    if (!material.ok) {
      logChatPersistenceError({
        step: "material",
        sessionId,
        materialId: rawMaterialId,
        userId: user.data,
        error: new Error(material.error),
      });
      return material;
    }
  }

  const answer = isAllMaterials
    ? await answerQuestionAllMaterials({ question, topK, userId: user.data })
    : await answerQuestionFromMaterial({ materialId: rawMaterialId!, question, topK });

  if (!answer.ok) {
    logChatPersistenceError({
      step: "answer",
      sessionId,
      materialId: rawMaterialId ?? undefined,
      userId: user.data,
      error: new Error(answer.error),
    });
    return answer;
  }

  const savedMessages = await saveChatMessagePair({
    sessionId,
    userId: user.data,
    question,
    answer: answer.data.answer,
    sourceChunkIds: answer.data.source_chunk_ids,
    userMetadata: { material_id: rawMaterialId ?? "__all__" },
    assistantMetadata: {
      material_id: rawMaterialId ?? "__all__",
      insufficient_context: answer.data.insufficient_context,
      source_count: answer.data.sources.length,
    },
  });

  if (!savedMessages.ok) return savedMessages;
  revalidateChatViews(rawMaterialId);

  return {
    ok: true,
    data: {
      ...answer.data,
      session_id: sessionId,
      user_message_id: savedMessages.data.userMessage.id,
      assistant_message_id: savedMessages.data.assistantMessage.id,
    },
  };
}
export async function loadChatSessionMessages(
  sessionId: string,
): Promise<MaterialActionResult<ChatMessageView[]>> {
  return getChatSessionMessages(sessionId);
}

export async function renameChatSessionAction(input: {
  sessionId: string;
  title: string;
}): Promise<MaterialActionResult<{ id: string; title: string }>> {
  const result = await renameChatSession(input);

  if (result.ok) {
    revalidateChatViews();
  }

  return result;
}

export async function loadSourceSnippetsForMessage(input: {
  sessionId: string;
  chunkIds: string[];
}): Promise<MaterialActionResult<{ id: string; material_id: string; chunk_index: number; snippet: string; similarity: number }[]>> {
  const sessionId = input.sessionId.trim();

  if (!sessionId) {
    return { ok: false, error: "Chat session not found." };
  }

  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    return user;
  }

  // Verify session belongs to this user
  const session = await getOwnedChatSession({ sessionId, userId: user.data });

  if (!session.ok) {
    return session;
  }

  const chunks = await getChunksByIds({ chunkIds: input.chunkIds, userId: user.data });

  if (!chunks.ok) {
    return chunks;
  }

  return {
    ok: true,
    data: chunks.data.map((chunk) => ({
      id: chunk.id,
      material_id: chunk.material_id,
      chunk_index: chunk.chunk_index,
      snippet: chunk.snippet,
      similarity: 0,
    })),
  };
}
