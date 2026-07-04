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
import { LIMIT_REACHED_MESSAGE, assertAiUsageAllowed } from "@/lib/ai/usage";
import { logApiEvent, logErrorEvent } from "@/lib/logging/actions";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Quiz,
  QuizActionResult,
  QuizAttempt,
  QuizAttemptSubmissionInput,
  QuizAttemptSummary,
  QuizGenerationInput,
  QuizQuestion,
  QuizView,
} from "@/types/quizzes";

import {
  getAuthenticatedQuizUserId,
  getQuizAttemptReview,
  getSanitizedQuizForAttempt,
} from "./queries";
import {
  validateQuizAttemptSubmissionInput,
  validateQuizGenerationInput,
} from "./validation";

const QUIZ_SELECT =
  "id,user_id,material_id,title,topic,difficulty,question_count,created_at,updated_at";

const QUESTION_SELECT =
  "id,quiz_id,user_id,question,options,correct_answer,explanation,topic,difficulty,order_index,created_at";

const QUIZ_ATTEMPT_SELECT =
  "id,quiz_id,user_id,score,total_questions,correct_count,answers,started_at,completed_at";

const QUIZ_GENERATION_VALIDATION_HINT =
  "Return quiz_title, topic, difficulty, and the requested number of questions. Each question needs order_index, question, options (exactly 4 distinct non-empty strings), correct_answer (must exactly match one option), explanation, topic, and difficulty.";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

async function logQuizActionSuccess(input: {
  userId: string;
  quizId: string;
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  questionCount: number;
}) {
  await logApiEvent({
    userId: input.userId,
    route: "generateQuiz",
    method: "server_action",
    featureType: "quiz",
    status: "success",
    durationMs: input.durationMs,
    metadata: {
      quiz_id: input.quizId,
      material_id: input.materialId,
      requested_count: input.requestedCount,
      difficulty: input.difficulty,
      question_count: input.questionCount,
      retry_count: input.retryCount ?? null,
    },
  });
}

async function logQuizActionError(input: {
  userId: string;
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
  safeMessage: string;
}) {
  const metadata = {
    material_id: input.materialId,
    requested_count: input.requestedCount,
    difficulty: input.difficulty,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode,
  };

  await logApiEvent({
    userId: input.userId,
    route: "generateQuiz",
    method: "server_action",
    featureType: "quiz",
    status: "error",
    durationMs: input.durationMs,
    metadata,
  });
  await logErrorEvent({
    userId: input.userId,
    category: "ai_generation",
    safeMessage: input.safeMessage,
    source: "generateQuiz",
    featureType: "quiz",
    severity: "error",
    metadata,
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

function revalidateQuizAttemptViews() {
  revalidateQuizViews();
  revalidatePath(dashboardRoutes.progress);
}

async function recordQuizAttemptProgressEvent(input: {
  userId: string;
  quizId: string;
  attemptId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
}): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("progress_events").insert({
    user_id: input.userId,
    event_type: "quiz_attempted",
    entity_type: "quiz",
    entity_id: input.quizId,
    metadata: {
      attempt_id: input.attemptId,
      score: input.score,
      total_questions: input.totalQuestions,
      correct_count: input.correctCount,
      quiz_title: input.quizTitle,
    },
  });

  return !error;
}

export async function loadQuizForAttempt(quizId: string) {
  return getSanitizedQuizForAttempt(quizId);
}

export async function loadQuizAttemptReview(attemptId: string) {
  return getQuizAttemptReview(attemptId);
}
export async function deleteQuiz(
  quizId: string,
): Promise<QuizActionResult<{ deleted: boolean }>> {
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const normalizedQuizId = quizId.trim();

  if (!UUID_PATTERN.test(normalizedQuizId)) {
    return {
      ok: false,
      error: "Quiz could not be deleted.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("delete_quiz", {
    p_quiz_id: normalizedQuizId,
  });

  if (error || data !== true) {
    console.error("[Day8 Quiz] Failed to delete quiz", {
      quizId: normalizedQuizId,
      code: error?.code,
      message: error?.message,
    });

    return {
      ok: false,
      error: "Quiz could not be deleted.",
    };
  }

  revalidateQuizAttemptViews();

  return {
    ok: true,
    data: { deleted: true },
  };
}
export async function submitQuizAttempt(
  input: QuizAttemptSubmissionInput,
): Promise<QuizActionResult<QuizAttemptSummary>> {
  const user = await getAuthenticatedQuizUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateQuizAttemptSubmissionInput(input);

  if (!validation.ok) {
    return validation;
  }

  const supabase = await createSupabaseServerClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(QUIZ_SELECT)
    .eq("id", validation.data.quizId)
    .eq("user_id", user.data)
    .maybeSingle<Quiz>();

  if (quizError || !quiz) {
    return {
      ok: false,
      error: "Quiz not found.",
    };
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(QUESTION_SELECT)
    .eq("quiz_id", quiz.id)
    .eq("user_id", user.data)
    .order("order_index", { ascending: true })
    .returns<QuizQuestion[]>();

  if (questionsError) {
    console.error("[Day8 Quiz] Failed to load questions for scoring", {
      quizId: quiz.id,
      code: questionsError.code,
      message: questionsError.message,
    });

    return {
      ok: false,
      error: "Could not score quiz. Please try again.",
    };
  }

  const savedQuestions = questions ?? [];

  if (savedQuestions.length === 0) {
    return {
      ok: false,
      error: "This quiz has no questions to score.",
    };
  }

  const questionById = new Map(
    savedQuestions.map((question) => [question.id, question]),
  );
  const normalizedAnswers: Record<string, string> = {};

  for (const [questionId, selectedAnswer] of Object.entries(
    validation.data.answers,
  )) {
    const question = questionById.get(questionId);

    if (!question || !question.options.includes(selectedAnswer)) {
      return {
        ok: false,
        error: "Submitted answers do not match this quiz.",
      };
    }

    normalizedAnswers[questionId] = selectedAnswer;
  }

  const totalQuestions = savedQuestions.length;
  const correctCount = savedQuestions.filter(
    (question) => normalizedAnswers[question.id] === question.correct_answer,
  ).length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const completedAt = new Date().toISOString();

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quiz.id,
      user_id: user.data,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      answers: normalizedAnswers,
      completed_at: completedAt,
    })
    .select(QUIZ_ATTEMPT_SELECT)
    .maybeSingle<QuizAttempt>();

  if (attemptError || !attempt) {
    console.error("[Day8 Quiz] Failed to save quiz attempt", {
      quizId: quiz.id,
      code: attemptError?.code,
      message: attemptError?.message,
    });

    return {
      ok: false,
      error: "Score could not be saved.",
    };
  }

  const progressSaved = await recordQuizAttemptProgressEvent({
    userId: user.data,
    quizId: quiz.id,
    attemptId: attempt.id,
    quizTitle: quiz.title,
    score,
    totalQuestions,
    correctCount,
  });

  revalidateQuizAttemptViews();

  return {
    ok: true,
    data: {
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: quiz.title,
      score: Number(attempt.score),
      total_questions: attempt.total_questions,
      correct_count: attempt.correct_count,
      completed_at: attempt.completed_at,
      progress_warning: progressSaved
        ? undefined
        : "Progress could not be recorded.",
    },
  };
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
    const rateLimit = await checkRateLimit("quiz", {
      userId: user.data,
      route: "generateQuiz",
    });

    if (!rateLimit.allowed) {
      return {
        ok: false,
        error: rateLimit.message ?? LIMIT_REACHED_MESSAGE,
      };
    }

    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "quiz",
      route: "generateQuiz",
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
      await logQuizActionError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Quiz save failed.",
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
      await logQuizActionError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Quiz questions save failed.",
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

    await logQuizActionSuccess({
      userId: user.data,
      quizId: quiz.id,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generated.retryCount,
      questionCount: questions.length,
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
          topic: q.topic,
          difficulty: q.difficulty as Quiz["difficulty"],
          order_index: q.order_index,
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

    const safeMessage =
      error instanceof AiConfigurationError
        ? AI_SAFE_MESSAGES.configurationUnavailable
        : getSafeAiErrorMessage(error);

    await logQuizActionError({
      userId: user.data,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
      safeMessage,
    });

    if (error instanceof AiConfigurationError) {
      return {
        ok: false,
        error: safeMessage,
      };
    }

    return {
      ok: false,
      error: safeMessage,
    };
  }
}








