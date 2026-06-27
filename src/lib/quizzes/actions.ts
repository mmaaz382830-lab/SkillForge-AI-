"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  AI_SAFE_MESSAGES,
  AiConfigurationError,
  AiInvalidOutputError,
  AiProviderError,
  AiUsageLimitError,
  buildQuizPrompt,
  generateValidatedJson,
  getSafeAiErrorMessage,
  logAiUsageEvent,
} from "@/lib/ai";
import {
  aiQuizOutputSchema,
  type AiQuizOutput,
} from "@/lib/ai/schemas";
import { assertAiUsageAllowed } from "@/lib/ai/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Quiz,
  QuizActionResult,
  QuizGenerationInput,
  QuizView,
} from "@/types/quizzes";

import { getAuthenticatedQuizUserId } from "./queries";
import { validateQuizGenerationInput } from "./validation";

const QUIZ_SELECT =
  "id,user_id,material_id,title,topic,difficulty,question_count,created_at,updated_at";

const QUIZ_GENERATION_VALIDATION_HINT =
  "Return quiz_title, topic, difficulty, and the requested number of questions. Each question needs order_index, question, options (exactly 4 distinct non-empty strings), correct_answer (must exactly match one option), explanation, topic, and difficulty.";

type CompletedMaterialForQuiz = {
  id: string;
  title: string;
  extracted_text: string | null;
  processing_status: string;
  deleted_at: string | null;
};

function getErrorCode(error: unknown): string {
  if (error instanceof AiInvalidOutputError) {
    return "INVALID_OUTPUT";
  }

  if (error instanceof AiConfigurationError) {
    return "AI_CONFIGURATION_UNAVAILABLE";
  }

  if (error instanceof AiProviderError) {
    return `AI_PROVIDER_${error.code.toUpperCase()}`;
  }

  return "QUIZ_GENERATION_FAILED";
}

function buildQuizUsageMetadata(input: {
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

async function logQuizGenerationError(input: {
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
    featureType: "quiz",
    status: "error",
    errorCode: input.errorCode,
    metadata: buildQuizUsageMetadata(input),
  });
}

async function loadOwnedCompletedMaterialForQuiz(input: {
  materialId: string;
  userId: string;
}): Promise<CompletedMaterialForQuiz | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,extracted_text,processing_status,deleted_at")
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<CompletedMaterialForQuiz>();

  if (error || !data) {
    return null;
  }

  if (data.processing_status !== "completed" || !data.extracted_text?.trim()) {
    return null;
  }

  return data;
}

function normalizeGeneratedQuestions(input: {
  output: AiQuizOutput;
  quizId: string;
  userId: string;
}): Array<{
  quiz_id: string;
  user_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic: string | null;
  difficulty: string;
  order_index: number;
}> {
  return [...input.output.questions]
    .sort((a, b) => a.order_index - b.order_index)
    .map((q, index) => ({
      quiz_id: input.quizId,
      user_id: input.userId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic ?? input.output.topic ?? null,
      difficulty: q.difficulty,
      order_index: index + 1,
    }));
}

function revalidateQuizViews() {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.quizzes);
}

export async function generateQuiz(
  input: QuizGenerationInput,
): Promise<QuizActionResult<QuizView>> {
  const startedAt = Date.now();
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateQuizGenerationInput(input);

  if (!validation.ok) {
    return validation;
  }

  const material = await loadOwnedCompletedMaterialForQuiz({
    materialId: validation.data.material_id,
    userId: user.data,
  });

  if (!material) {
    return {
      ok: false,
      error: "Select a processed material first.",
    };
  }

  const usageMetadata = buildQuizUsageMetadata({
    materialId: validation.data.material_id,
    requestedCount: validation.data.question_count,
    difficulty: validation.data.difficulty,
  });

  try {
    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "quiz",
      metadata: usageMetadata,
    });

    const prompt = buildQuizPrompt({
      topic: validation.data.topic ?? material.title,
      difficulty: validation.data.difficulty,
      materialContext: material.extracted_text ?? undefined,
      questionCount: validation.data.question_count,
    });

    const generated = await generateValidatedJson({
      prompt,
      schema: aiQuizOutputSchema,
      validationHint: QUIZ_GENERATION_VALIDATION_HINT,
      temperature: 0.25,
    });

    const supabase = await createSupabaseServerClient();

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.data,
        material_id: validation.data.material_id,
        title: generated.data.quiz_title,
        topic: generated.data.topic ?? validation.data.topic,
        difficulty: generated.data.difficulty,
        question_count: generated.data.questions.length,
      })
      .select(QUIZ_SELECT)
      .maybeSingle<Quiz>();

    if (quizError || !quiz) {
      const errorCode = "QUIZ_SAVE_FAILED";
      await logQuizGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return {
        ok: false,
        error: "Could not save quiz. Please try again.",
      };
    }

    const questions = normalizeGeneratedQuestions({
      output: generated.data,
      quizId: quiz.id,
      userId: user.data,
    });

    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(questions);

    if (questionsError) {
      // Clean up the orphaned quiz row
      await supabase
        .from("quizzes")
        .delete()
        .eq("id", quiz.id)
        .eq("user_id", user.data);

      const errorCode = "QUIZ_QUESTIONS_SAVE_FAILED";
      await logQuizGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return {
        ok: false,
        error: "Could not save quiz. Please try again.",
      };
    }

    await logAiUsageEvent({
      userId: user.data,
      featureType: "quiz",
      status: "success",
      provider: generated.provider,
      model: generated.model,
      metadata: buildQuizUsageMetadata({
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
      }),
    });

    revalidateQuizViews();

    return {
      ok: true,
      data: {
        id: quiz.id,
        material_id: quiz.material_id,
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        question_count: quiz.question_count,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
        questions: questions.map((q, index) => ({
          id: `optimistic-${index}`,
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty as Quiz["difficulty"],
          order_index: q.order_index,
          created_at: quiz.created_at,
          updated_at: quiz.updated_at,
        })),
      },
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return {
        ok: false,
        error: error.safeMessage,
      };
    }

    const errorCode = getErrorCode(error);
    await logQuizGenerationError({
      userId: user.data,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
    });

    if (error instanceof AiConfigurationError) {
      return {
        ok: false,
        error: AI_SAFE_MESSAGES.configurationUnavailable,
      };
    }

    return {
      ok: false,
      error: getSafeAiErrorMessage(error),
    };
  }
}
