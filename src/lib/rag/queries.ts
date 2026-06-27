import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MaterialActionResult } from "@/types/materials";

type CompletedMaterialForRag = {
  id: string;
  user_id: string;
  title: string;
  extracted_text: string | null;
  processing_status: string;
  deleted_at: string | null;
  chunk_count: number | null;
};

export type ChatSession = {
  id: string;
  user_id: string;
  material_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ChatSessionListItem = Omit<ChatSession, "user_id" | "deleted_at">;

export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  chat_session_id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  source_chunk_ids: string[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ChatMessageView = Omit<ChatMessage, "user_id">;

const CHAT_SESSION_SELECT =
  "id,user_id,material_id,title,created_at,updated_at,deleted_at";
const CHAT_SESSION_LIST_SELECT =
  "id,material_id,title,created_at,updated_at";
const CHAT_MESSAGE_SELECT =
  "id,chat_session_id,user_id,role,content,source_chunk_ids,metadata,created_at";

export async function getAuthenticatedRagUserId(): Promise<
  MaterialActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: "Please log in to continue.",
    };
  }

  return {
    ok: true,
    data: data.user.id,
  };
}

export async function getOwnedCompletedMaterialForRag(input: {
  materialId: string;
  userId: string;
}): Promise<MaterialActionResult<CompletedMaterialForRag>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,user_id,title,extracted_text,processing_status,deleted_at,chunk_count")
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<CompletedMaterialForRag>();

  if (error) {
    return {
      ok: false,
      error: "Could not load material.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  if (data.processing_status !== "completed") {
    return {
      ok: false,
      error: "This material is not ready for AI chat yet.",
    };
  }

  if (!data.extracted_text?.trim()) {
    return {
      ok: false,
      error: "This material does not have text to index.",
    };
  }

  return {
    ok: true,
    data,
  };
}

export async function countOwnedMaterialChunks(input: {
  materialId: string;
  userId: string;
}): Promise<MaterialActionResult<number>> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("material_chunks")
    .select("id", { count: "exact", head: true })
    .eq("material_id", input.materialId)
    .eq("user_id", input.userId);

  if (error) {
    return {
      ok: false,
      error: "Could not load indexed material chunks.",
    };
  }

  return {
    ok: true,
    data: count ?? 0,
  };
}

export async function listChatSessions(): Promise<
  MaterialActionResult<ChatSessionListItem[]>
> {
  const user = await getAuthenticatedRagUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select(CHAT_SESSION_LIST_SELECT)
    .eq("user_id", user.data)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .returns<ChatSessionListItem[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load chat sessions.",
    };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function getOwnedChatSession(input: {
  sessionId: string;
  userId: string;
}): Promise<MaterialActionResult<ChatSession>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select(CHAT_SESSION_SELECT)
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<ChatSession>();

  if (error) {
    return {
      ok: false,
      error: "Could not load chat session.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "Chat session not found.",
    };
  }

  return {
    ok: true,
    data,
  };
}

export async function getChatSession(
  sessionId: string,
): Promise<MaterialActionResult<ChatSessionListItem>> {
  const id = sessionId.trim();

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

  const session = await getOwnedChatSession({
    sessionId: id,
    userId: user.data,
  });

  if (!session.ok) {
    return session;
  }

  return {
    ok: true,
    data: {
      id: session.data.id,
      material_id: session.data.material_id,
      title: session.data.title,
      created_at: session.data.created_at,
      updated_at: session.data.updated_at,
    },
  };
}

export async function getChatSessionMessages(
  sessionId: string,
): Promise<MaterialActionResult<ChatMessageView[]>> {
  const id = sessionId.trim();

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

  const session = await getOwnedChatSession({
    sessionId: id,
    userId: user.data,
  });

  if (!session.ok) {
    return session;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select(CHAT_MESSAGE_SELECT)
    .eq("chat_session_id", id)
    .eq("user_id", user.data)
    .order("created_at", { ascending: true })
    .returns<ChatMessage[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load chat messages.",
    };
  }

  return {
    ok: true,
    data: (data ?? []).map((message) => ({
      id: message.id,
      chat_session_id: message.chat_session_id,
      role: message.role,
      content: message.content,
      source_chunk_ids: message.source_chunk_ids,
      metadata: message.metadata,
      created_at: message.created_at,
    })),
  };
}

