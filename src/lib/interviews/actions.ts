"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  AI_SAFE_MESSAGES,
  AiConfigurationError,
  AiInvalidOutputError,
  AiProviderError,
  AiUsageLimitError,
  buildInterviewFeedbackPrompt,
  buildInterviewQuestionsPrompt,
  generateValidatedJson,
  getSafeAiErrorMessage,
  logAiUsageEvent,
} from "@/lib/ai";
import {
  aiInterviewQuestionsOutputSchema,
  type AiInterviewQuestionsOutput,
} from "@/lib/ai/schemas";
import { LIMIT_REACHED_MESSAGE, assertAiUsageAllowed } from "@/lib/ai/usage";
import { logApiEvent, logErrorEvent } from "@/lib/logging/actions";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  InterviewActionResult,
  InterviewAnswerSubmissionInput,
  InterviewAnswerSubmissionResult,
  InterviewFeedback,
  InterviewGenerationInput,
  InterviewMessage,
  InterviewQuestionMessageFeedback,
  InterviewSession,
  InterviewSessionPracticeState,
  InterviewSessionView,
} from "@/types/interviews";

import {
  getAuthenticatedInterviewUserId,
  getInterviewSessionPracticeState,
  isInterviewAiFeedback,
  isInterviewAnswerFeedback,
  isInterviewQuestionFeedback,
} from "./queries";
import {
  interviewFeedbackSchema,
  validateInterviewAnswerSubmissionInput,
  validateInterviewGenerationInput,
} from "./validation";

const SESSION_SELECT =
  "id,user_id,material_id,goal_id,topic,difficulty,status,overall_feedback,score,created_at,completed_at";

const MESSAGE_SELECT =
  "id,session_id,user_id,role,content,feedback,created_at";

const INTERVIEW_GENERATION_VALIDATION_HINT =
  "Return session_title, topic, difficulty, and the requested number of questions. Each question needs order_index, question (non-empty text), expected_answer_points (non-empty array of strings), difficulty, and topic.";

const INTERVIEW_FEEDBACK_VALIDATION_HINT =
  "Return strengths, missing_points, improved_answer, score, and next_practice_tip. strengths and missing_points must be arrays of strings. score must be a number from 0 to 10.";

const INTERVIEW_FEEDBACK_SAFE_ERROR = "Could not generate feedback.";

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
  materialId: string | null;
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
  materialId: string | null;
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

async function logInterviewActionSuccess(input: {
  route: "generateInterviewQuestions" | "submitInterviewAnswer";
  userId: string;
  sessionId?: string;
  materialId: string | null;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  generatedItemCount: number;
  questionMessageId?: string;
  hasAnswer?: boolean;
}) {
  await logApiEvent({
    userId: input.userId,
    route: input.route,
    method: "server_action",
    featureType: "interview",
    status: "success",
    durationMs: input.durationMs,
    metadata: {
      session_id: input.sessionId ?? null,
      material_id: input.materialId,
      requested_count: input.requestedCount,
      difficulty: input.difficulty,
      generated_item_count: input.generatedItemCount,
      retry_count: input.retryCount ?? null,
      question_message_id: input.questionMessageId ?? null,
      has_answer: input.hasAnswer ?? null,
    },
  });
}

async function logInterviewActionError(input: {
  route: "generateInterviewQuestions" | "submitInterviewAnswer";
  userId: string;
  sessionId?: string;
  materialId: string | null;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
  safeMessage: string;
  questionMessageId?: string;
  hasAnswer?: boolean;
}) {
  const metadata = {
    session_id: input.sessionId ?? null,
    material_id: input.materialId,
    requested_count: input.requestedCount,
    difficulty: input.difficulty,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode,
    question_message_id: input.questionMessageId ?? null,
    has_answer: input.hasAnswer ?? null,
  };

  await logApiEvent({
    userId: input.userId,
    route: input.route,
    method: "server_action",
    featureType: "interview",
    status: "error",
    durationMs: input.durationMs,
    metadata,
  });
  await logErrorEvent({
    userId: input.userId,
    category: "ai_generation",
    safeMessage: input.safeMessage,
    source: input.route,
    featureType: "interview",
    severity: "error",
    metadata,
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
  feedback: InterviewQuestionMessageFeedback;
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

function buildFeedbackSummary(feedback: InterviewFeedback): string {
  const firstMissingPoint = feedback.missing_points[0];
  const firstTip = feedback.next_practice_tip;

  return [
    `Score: ${feedback.score}/10.`,
    firstMissingPoint ? `Focus area: ${firstMissingPoint}` : null,
    firstTip ? `Next tip: ${firstTip}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function revalidateInterviewViews() {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.interview);
  revalidatePath(dashboardRoutes.progress);
}

function revalidateInterviewPracticeViews() {
  revalidateInterviewViews();
  revalidatePath(dashboardRoutes.progress);
}

async function recordInterviewCompletedProgressEvent(input: {
  userId: string;
  sessionId: string;
  topic: string;
  score: number | null;
  questionCount: number;
}): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("progress_events").insert({
    user_id: input.userId,
    event_type: "interview_completed",
    entity_type: "interview",
    entity_id: input.sessionId,
    metadata: {
      session_id: input.sessionId,
      topic: input.topic,
      score: input.score,
      question_count: input.questionCount,
    },
  });

  return !error;
}

function getAnsweredQuestionIds(messages: InterviewMessage[]): Set<string> {
  const answeredQuestionIds = new Set<string>();

  for (const message of messages) {
    if (message.role === "user" && isInterviewAnswerFeedback(message.feedback)) {
      answeredQuestionIds.add(message.feedback.question_message_id);
    }
  }

  return answeredQuestionIds;
}

function getQuestionMessages(messages: InterviewMessage[]): InterviewMessage[] {
  return messages.filter(
    (message) =>
      message.role === "assistant" && isInterviewQuestionFeedback(message.feedback),
  );
}

function getFeedbackScores(messages: InterviewMessage[]): number[] {
  return messages
    .filter(
      (message) =>
        message.role === "assistant" && isInterviewAiFeedback(message.feedback),
    )
    .map((message) => (isInterviewAiFeedback(message.feedback) ? message.feedback.score : null))
    .filter((score): score is number => typeof score === "number");
}

async function completeSessionIfReady(input: {
  session: InterviewSession;
  userId: string;
}): Promise<{ completed: boolean; score: number | null; progressSaved: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data: messages, error } = await supabase
    .from("interview_messages")
    .select(MESSAGE_SELECT)
    .eq("session_id", input.session.id)
    .eq("user_id", input.userId)
    .order("created_at", { ascending: true })
    .returns<InterviewMessage[]>();

  if (error) {
    return { completed: false, score: input.session.score, progressSaved: true };
  }

  const savedMessages = messages ?? [];
  const questionMessages = getQuestionMessages(savedMessages);
  const answeredQuestionIds = getAnsweredQuestionIds(savedMessages);
  const allAnswered =
    questionMessages.length > 0 &&
    questionMessages.every((question) => answeredQuestionIds.has(question.id));

  if (!allAnswered) {
    return { completed: false, score: input.session.score, progressSaved: true };
  }

  const scores = getFeedbackScores(savedMessages);
  const averageScore = scores.length > 0
    ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
    : null;
  const overallFeedback = averageScore == null
    ? `Completed ${questionMessages.length} interview questions.`
    : `Completed ${questionMessages.length} interview questions with an average score of ${averageScore}/10.`;

  const wasAlreadyCompleted = input.session.status === "completed";
  const completedAt = input.session.completed_at ?? new Date().toISOString();

  const { error: updateError } = await supabase
    .from("interview_sessions")
    .update({
      status: "completed",
      completed_at: completedAt,
      score: averageScore,
      overall_feedback: overallFeedback,
    })
    .eq("id", input.session.id)
    .eq("user_id", input.userId);

  if (updateError) {
    return { completed: false, score: input.session.score, progressSaved: true };
  }

  const progressSaved = wasAlreadyCompleted
    ? true
    : await recordInterviewCompletedProgressEvent({
        userId: input.userId,
        sessionId: input.session.id,
        topic: input.session.topic,
        score: averageScore,
        questionCount: questionMessages.length,
      });

  return { completed: true, score: averageScore, progressSaved };
}

export async function loadInterviewPracticeState(
  sessionId: string,
): Promise<InterviewActionResult<InterviewSessionPracticeState>> {
  return getInterviewSessionPracticeState(sessionId);
}

export async function submitInterviewAnswer(
  input: InterviewAnswerSubmissionInput,
): Promise<InterviewActionResult<InterviewAnswerSubmissionResult>> {
  const startedAt = Date.now();
  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) return user;

  const validation = validateInterviewAnswerSubmissionInput(input);

  if (!validation.ok) return validation;

  const supabase = await createSupabaseServerClient();
  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select(SESSION_SELECT)
    .eq("id", validation.data.sessionId)
    .eq("user_id", user.data)
    .maybeSingle<InterviewSession>();

  if (sessionError || !session) {
    return { ok: false, error: "Interview session not found." };
  }

  const { data: question, error: questionError } = await supabase
    .from("interview_messages")
    .select(MESSAGE_SELECT)
    .eq("id", validation.data.questionMessageId)
    .eq("session_id", session.id)
    .eq("user_id", user.data)
    .eq("role", "assistant")
    .maybeSingle<InterviewMessage>();

  if (
    questionError ||
    !question ||
    !isInterviewQuestionFeedback(question.feedback)
  ) {
    console.error("[Day8 Interview Feedback] failed", {
      stage: "question_lookup",
      sessionId: validation.data.sessionId,
      questionMessageId: validation.data.questionMessageId,
      hasQuestionError: Boolean(questionError),
      hasQuestion: Boolean(question),
      feedbackValid: question ? isInterviewQuestionFeedback(question.feedback) : false,
    });
    return { ok: false, error: "Interview question not found." };
  }

  const { data: existingMessages, error: existingMessagesError } = await supabase
    .from("interview_messages")
    .select(MESSAGE_SELECT)
    .eq("session_id", session.id)
    .eq("user_id", user.data)
    .returns<InterviewMessage[]>();

  if (existingMessagesError) {
    return { ok: false, error: "Could not submit answer." };
  }

  const alreadyAnswered = (existingMessages ?? []).some(
    (message) =>
      message.role === "user" &&
      isInterviewAnswerFeedback(message.feedback) &&
      message.feedback.question_message_id === question.id,
  );

  if (alreadyAnswered) {
    return { ok: false, error: "This question has already been answered." };
  }

  const questionFeedback = question.feedback;
  const usageMetadata = buildInterviewUsageMetadata({
    materialId: session.material_id,
    requestedCount: 1,
    difficulty: questionFeedback.difficulty,
  });

  let generatedFeedback;

  try {
    const rateLimit = await checkRateLimit("interview", {
      userId: user.data,
      route: "submitInterviewAnswer",
    });

    if (!rateLimit.allowed) {
      return {
        ok: false,
        error: rateLimit.message ?? LIMIT_REACHED_MESSAGE,
      };
    }

    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "interview",
      route: "submitInterviewAnswer",
      metadata: usageMetadata,
    });

    const prompt = buildInterviewFeedbackPrompt({
      question: question.content,
      expectedAnswerPoints: questionFeedback.expected_answer_points,
      userAnswer: validation.data.answer,
      difficulty: questionFeedback.difficulty,
    });

    generatedFeedback = await generateValidatedJson({
      prompt,
      schema: interviewFeedbackSchema,
      validationHint: INTERVIEW_FEEDBACK_VALIDATION_HINT,
      temperature: 0.2,
    });
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return { ok: false, error: error.safeMessage };
    }

    const errorCode = getErrorCode(error);
    console.error("[Day8 Interview Feedback] failed", {
      stage: "ai_generation",
      sessionId: validation.data.sessionId,
      questionMessageId: validation.data.questionMessageId,
      hasAnswer: Boolean(validation.data.answer?.trim()),
      expectedPointsCount: questionFeedback.expected_answer_points?.length ?? 0,
      errorCode,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    await logInterviewGenerationError({
      userId: user.data,
      materialId: session.material_id,
      requestedCount: 1,
      difficulty: questionFeedback.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
    });
    await logInterviewActionError({
      route: "submitInterviewAnswer",
      userId: user.data,
      sessionId: session.id,
      materialId: session.material_id,
      requestedCount: 1,
      difficulty: questionFeedback.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
      safeMessage: INTERVIEW_FEEDBACK_SAFE_ERROR,
      questionMessageId: question.id,
      hasAnswer: Boolean(validation.data.answer.trim()),
    });

    return { ok: false, error: INTERVIEW_FEEDBACK_SAFE_ERROR };
  }

  const feedback = generatedFeedback.data;
  const feedbackMetadata = {
    ...feedback,
    type: "feedback" as const,
    question_message_id: question.id,
  };

  const { data: insertedMessages, error: insertError } = await supabase
    .from("interview_messages")
    .insert([
      {
        session_id: session.id,
        user_id: user.data,
        role: "user",
        content: validation.data.answer,
        feedback: {
          type: "answer",
          question_message_id: question.id,
        },
      },
      {
        session_id: session.id,
        user_id: user.data,
        role: "assistant",
        content: buildFeedbackSummary(feedback),
        feedback: feedbackMetadata,
      },
    ])
    .select(MESSAGE_SELECT)
    .returns<InterviewMessage[]>();

  if (insertError || !insertedMessages || insertedMessages.length < 2) {
    console.error("[Day8 Interview Feedback] failed", {
      stage: "db_insert",
      sessionId: session.id,
      questionMessageId: question.id,
      errorCode: insertError?.code,
      errorMessage: insertError?.message,
      insertedCount: insertedMessages?.length ?? 0,
    });

    await logInterviewGenerationError({
      userId: user.data,
      materialId: session.material_id,
      requestedCount: 1,
      difficulty: questionFeedback.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generatedFeedback.retryCount,
      errorCode: "INTERVIEW_FEEDBACK_SAVE_FAILED",
    });
    await logInterviewActionError({
      route: "submitInterviewAnswer",
      userId: user.data,
      sessionId: session.id,
      materialId: session.material_id,
      requestedCount: 1,
      difficulty: questionFeedback.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generatedFeedback.retryCount,
      errorCode: "INTERVIEW_FEEDBACK_SAVE_FAILED",
      safeMessage: "Interview feedback save failed.",
      questionMessageId: question.id,
      hasAnswer: Boolean(validation.data.answer.trim()),
    });

    return { ok: false, error: "Could not save answer. Please try again." };
  }

  await logAiUsageEvent({
    userId: user.data,
    featureType: "interview",
    status: "success",
    provider: generatedFeedback.provider,
    model: generatedFeedback.model,
    metadata: buildInterviewUsageMetadata({
      materialId: session.material_id,
      requestedCount: 1,
      difficulty: questionFeedback.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generatedFeedback.retryCount,
    }),
  });

  await logInterviewActionSuccess({
    route: "submitInterviewAnswer",
    userId: user.data,
    sessionId: session.id,
    materialId: session.material_id,
    requestedCount: 1,
    difficulty: questionFeedback.difficulty,
    durationMs: Date.now() - startedAt,
    retryCount: generatedFeedback.retryCount,
    generatedItemCount: 1,
    questionMessageId: question.id,
    hasAnswer: Boolean(validation.data.answer.trim()),
  });

  const userAnswerMessage = insertedMessages.find((message) => message.role === "user");
  const feedbackMessage = insertedMessages.find(
    (message) => message.role === "assistant" && isInterviewAiFeedback(message.feedback),
  );

  if (!userAnswerMessage || !feedbackMessage) {
    return { ok: false, error: "Could not save answer. Please try again." };
  }

  const completion = await completeSessionIfReady({
    session,
    userId: user.data,
  });

  revalidateInterviewPracticeViews();

  return {
    ok: true,
    data: {
      session_id: session.id,
      question_message_id: question.id,
      answer_message_id: userAnswerMessage.id,
      feedback_message_id: feedbackMessage.id,
      feedback,
      completed: completion.completed,
      score: completion.score,
      progress_warning: completion.progressSaved
        ? undefined
        : "Progress could not be recorded.",
    },
  };
}

export async function generateInterviewQuestions(
  input: InterviewGenerationInput,
): Promise<InterviewActionResult<InterviewSessionView>> {
  const startedAt = Date.now();

  console.error("[Day8 Interview] generation input", {
    material_id: input?.material_id ?? null,
    keys: Object.keys(input ?? {})
  });

  if (!input?.material_id) {
    return { ok: false, error: "Select a processed material first." };
  }

  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) return user;

  const validation = validateInterviewGenerationInput(input);

  if (!validation.ok) return validation;

  const material = await loadOwnedCompletedMaterialForInterview({
    materialId: validation.data.material_id,
    userId: user.data,
  });

  if (!material || !material.extracted_text?.trim()) {
    return {
      ok: false,
      error: "Selected material is not ready. Choose a completed material.",
    };
  }

  const usageMetadata = buildInterviewUsageMetadata({
    materialId: validation.data.material_id,
    requestedCount: validation.data.question_count,
    difficulty: validation.data.difficulty,
  });

  try {
    const rateLimit = await checkRateLimit("interview", {
      userId: user.data,
      route: "generateInterviewQuestions",
    });

    if (!rateLimit.allowed) {
      return {
        ok: false,
        error: rateLimit.message ?? LIMIT_REACHED_MESSAGE,
      };
    }

    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "interview",
      route: "generateInterviewQuestions",
      metadata: usageMetadata,
    });

    const prompt = buildInterviewQuestionsPrompt({
      topic: validation.data.topic_focus ?? material.title,
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
      console.error("[Day8 Interview] session insert failed", {
        code: sessionError?.code,
        message: sessionError?.message,
      });

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
      await logInterviewActionError({
        route: "generateInterviewQuestions",
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Interview session save failed.",
      });

      return { ok: false, error: "Could not generate interview questions." };
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
      console.error("[Day8 Interview] messages insert failed", {
        code: messagesError.code,
        message: messagesError.message,
      });

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
      await logInterviewActionError({
        route: "generateInterviewQuestions",
        userId: user.data,
        sessionId: session.id,
        materialId: validation.data.material_id,
        requestedCount: validation.data.question_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Interview messages save failed.",
      });

      return { ok: false, error: "Could not generate interview questions." };
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

    await logInterviewActionSuccess({
      route: "generateInterviewQuestions",
      userId: user.data,
      sessionId: session.id,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generated.retryCount,
      generatedItemCount: messages.length,
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

    const safeMessage =
      error instanceof AiConfigurationError
        ? AI_SAFE_MESSAGES.configurationUnavailable
        : getSafeAiErrorMessage(error);

    await logInterviewActionError({
      route: "generateInterviewQuestions",
      userId: user.data,
      materialId: validation.data.material_id,
      requestedCount: validation.data.question_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
      safeMessage,
    });

    if (error instanceof AiConfigurationError) {
      return { ok: false, error: safeMessage };
    }

    return { ok: false, error: safeMessage };
  }
}

