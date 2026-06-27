"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  AI_SAFE_MESSAGES,
  AiConfigurationError,
  AiInvalidOutputError,
  AiProviderError,
  AiUsageLimitError,
  buildInterviewQuestionsPrompt,
  generateValidatedJson,
  getSafeAiErrorMessage,
  logAiUsageEvent,
} from "@/lib/ai";
import {
  aiInterviewQuestionsOutputSchema,
  type AiInterviewQuestionsOutput,
} from "@/lib/ai/schemas";
import { assertAiUsageAllowed } from "@/lib/ai/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  InterviewActionResult,
  InterviewGenerationInput,
  InterviewSession,
  InterviewSessionView,
} from "@/types/interviews";

import { getAuthenticatedInterviewUserId } from "./queries";
import { validateInterviewGenerationInput } from "./validation";

const SESSION_SELECT =
  "id,user_id,material_id,goal_id,topic,difficulty,status,overall_feedback,score,created_at,completed_at";

const INTERVIEW_GENERATION_VALIDATION_HINT =
  "Return session_title, topic, difficulty, and the requested number of questions. Each question needs order_index, question (non-empty text), expected_answer_points (non-empty array of strings), difficulty, and topic.";

type CompletedMaterialForInterview = {
  id: string;
  title: string;
  extracted_text: string | null;
  processing_status: string;
  deleted_at: string | null;
};

function getErrorCode(error: unknown): string {
  if (error instanceof AiInvalidOutputError) return "INVALID_OUTPUT";
  if (error instanceof AiConfigurationError) return "AI_CONFIGURATION_UNAVAILABLE";
  if (error instanceof AiProviderError) return `AI_PROVIDER_${error.code.toUpperCase()}`;
  return "INTERVIEW_GENERATION_FAILED";
}

function buildInterviewUsageMetadata(input: {
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs?: number;
  retryCount?: number;
  errorCode?: string;
}) {
  return {
    material_id: input.materialId,
    requested_count: input.requestedCount,
    difficulty: input.difficulty,
    duration_ms: input.durationMs ?? null,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode ?? null,
  };
}

async function logInterviewGenerationError(input: {
  userId: string;
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
}) {
  await logAiUsageEvent({
    userId: input.userId,
    featureType: "interview",
    status: "error",
    errorCode: input.errorCode,
    metadata: buildInterviewUsageMetadata(input),
  });
}

async function loadOwnedCompletedMaterialForInterview(input: {
  materialId: string;
  userId: string;
}): Promise<CompletedMaterialForInterview | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,extracted_text,processing_status,deleted_at")
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<CompletedMaterialForInterview>();

  if (error || !data) return null;

  if (data.processing_status !== "completed" || !data.extracted_text?.trim()) {
    return null;
  }

  return data;
}

function buildInterviewMessages(input: {
  output: AiInterviewQuestionsOutput;
  sessionId: string;
  userId: string;
}): Array<{
  session_id: string;
  user_id: string;
  role: "assistant";
  content: string;
  feedback: {
    order_index: number;
    expected_answer_points: string[];
    difficulty: string;
    topic: string | null;
  };
}> {
  return [...input.output.questions]
    .sort((a, b) => a.order_index - b.order_index)
    .map((q, index) => ({
      session_id: input.sessionId,
      user_id: input.userId,
      role: "assistant" as const,
      content: q.question,
      feedback: {
        order_index: index + 1,
        expected_answer_points: q.expected_answer_points,
        difficulty: q.difficulty,
        topic: q.topic ?? input.output.topic ?? null,
      },
    }));
}

function revalidateInterviewViews() {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.interview);
}

export async function generateInterviewQuestions(
  input: InterviewGenerationInput,
): Promise<InterviewActionResult<InterviewSessionView>> {
  const startedAt = Date.now();
  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) return user;

  const validation = validateInterviewGenerationInput(input);

  if (!validation.ok) return validation;

  const material = await loadOwnedCompletedMaterialForInterview({
    materialId: validation.data.material_id,
    userId: user.data,
  });

  if (!material) {
    return { ok: false, error: "Select a processed material first." };
  }

  const usageMetadata = buildInterviewUsageMetadata({
    materialId: validation.data.material_id,
    requestedCount: validation.data.question_count,
    difficulty: validation.data.difficulty,
  });

  try {
    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "interview",
      metadata: usageMetadata,
    });

    const prompt = buildInterviewQuestionsPrompt({
      topic: validation.data.topic ?? material.title,
      difficulty: validation.data.difficulty,
      materialContext: material.extracted_text ?? undefined,
      questionCount: validation.data.question_count,
    });

    const generated = await generateValidatedJson({
      prompt,
      schema: aiInterviewQuestionsOutputSchema,
      validationHint: INTERVIEW_GENERATION_VALIDATION_HINT,
      temperature: 0.3,
    });

    const supabase = await createSupabaseServerClient();

    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: user.data,
        material_id: validation.data.material_id,
        goal_id: null,
        topic: generated.data.topic,
        difficulty: generated.data.difficulty,
        status: "active",
        overall_feedback: null,
        score: null,
        completed_at: null,
      })
      .select(SESSION_SELECT)
      .maybeSingle<InterviewSession>();

    if (sessionError || !session) {
      const errorCode = "INTERVIEW_SESSION_SAVE_FAILED";
      await logInterviewGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return { ok: false, error: "Could not save interview questions. Please try again." };
    }

    const messages = buildInterviewMessages({
      output: generated.data,
      sessionId: session.id,
      userId: user.data,
    });

    const { error: messagesError } = await supabase
      .from("interview_messages")
      .insert(messages);

    if (messagesError) {
      // Clean up orphaned session row
      await supabase
        .from("interview_sessions")
        .delete()
        .eq("id", session.id)
        .eq("user_id", user.data);

      const errorCode = "INTERVIEW_MESSAGES_SAVE_FAILED";
      await logInterviewGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return { ok: false, error: "Could not save interview questions. Please try again." };
    }

    await logAiUsageEvent({
      userId: user.data,
      featureType: "interview",
      status: "success",
      provider: generated.provider,
      model: generated.model,
      metadata: buildInterviewUsageMetadata({
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
      }),
    });

    revalidateInterviewViews();

    return {
      ok: true,
      data: {
        id: session.id,
        material_id: session.material_id,
        goal_id: session.goal_id,
        topic: session.topic,
        difficulty: session.difficulty,
        status: session.status,
        overall_feedback: session.overall_feedback,
        score: session.score,
        created_at: session.created_at,
        completed_at: session.completed_at,
        messages: messages.map((m, index) => ({
          id: `optimistic-${index}`,
          session_id: session.id,
          role: m.role,
          content: m.content,
          feedback: {
            ...m.feedback,
            topic: m.feedback.topic,
            difficulty: m.feedback.difficulty as InterviewSession["difficulty"],
          },
          created_at: session.created_at,
        })),
      },
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return { ok: false, error: error.safeMessage };
    }

    const errorCode = getErrorCode(error);
    await logInterviewGenerationError({
      userId: user.data,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
    });

    if (error instanceof AiConfigurationError) {
      return { ok: false, error: AI_SAFE_MESSAGES.configurationUnavailable };
    }

    return { ok: false, error: getSafeAiErrorMessage(error) };
  }
}
