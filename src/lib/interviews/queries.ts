import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DifficultyLevel } from "@/types/app";
import type {
  InterviewActionResult,
  InterviewAnswerMessageFeedback,
  InterviewFeedbackMessageFeedback,
  InterviewMessage,
  InterviewMessageFeedback,
  InterviewQuestionMessageFeedback,
  InterviewSession,
  InterviewSessionPracticeState,
  InterviewSessionView,
} from "@/types/interviews";

const SESSION_SELECT =
  "id,user_id,material_id,goal_id,topic,difficulty,status,overall_feedback,score,created_at,completed_at";

const MESSAGE_SELECT =
  "id,session_id,user_id,role,content,feedback,created_at";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDifficulty(value: unknown): value is DifficultyLevel {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

export function isInterviewQuestionFeedback(
  feedback: InterviewMessageFeedback | null | undefined,
): feedback is InterviewQuestionMessageFeedback {
  if (!isRecord(feedback)) return false;

  const value = feedback as Record<string, unknown>;

  return (
    typeof value.order_index === "number" &&
    Array.isArray(value.expected_answer_points) &&
    isDifficulty(value.difficulty) &&
    (typeof value.topic === "string" || value.topic === null)
  );
}

export function isInterviewAnswerFeedback(
  feedback: InterviewMessageFeedback | null | undefined,
): feedback is InterviewAnswerMessageFeedback {
  if (!isRecord(feedback)) return false;

  const value = feedback as Record<string, unknown>;

  return value.type === "answer" && typeof value.question_message_id === "string";
}

export function isInterviewAiFeedback(
  feedback: InterviewMessageFeedback | null | undefined,
): feedback is InterviewFeedbackMessageFeedback {
  if (!isRecord(feedback)) return false;

  const value = feedback as Record<string, unknown>;

  return (
    value.type === "feedback" &&
    typeof value.question_message_id === "string" &&
    Array.isArray(value.strengths) &&
    Array.isArray(value.missing_points) &&
    typeof value.improved_answer === "string" &&
    typeof value.score === "number" &&
    typeof value.next_practice_tip === "string"
  );
}

export async function getAuthenticatedInterviewUserId(): Promise<
  InterviewActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { ok: false, error: "Please log in to continue." };
  }

  return { ok: true, data: data.user.id };
}

export async function listInterviewSessionViews(): Promise<
  InterviewActionResult<InterviewSessionView[]>
> {
  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const [sessionsResult, messagesResult] = await Promise.all([
    supabase
      .from("interview_sessions")
      .select(SESSION_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .returns<InterviewSession[]>(),
    supabase
      .from("interview_messages")
      .select(MESSAGE_SELECT)
      .eq("user_id", user.data)
      .eq("role", "assistant")
      .order("created_at", { ascending: true })
      .returns<InterviewMessage[]>(),
  ]);

  if (sessionsResult.error || messagesResult.error) {
    return { ok: false, error: "Could not load interview sessions." };
  }

  const messagesBySessionId = new Map<string, InterviewMessage[]>();

  for (const message of messagesResult.data ?? []) {
    if (!isInterviewQuestionFeedback(message.feedback)) {
      continue;
    }

    const msgs = messagesBySessionId.get(message.session_id) ?? [];
    msgs.push(message);
    messagesBySessionId.set(message.session_id, msgs);
  }

  return {
    ok: true,
    data: (sessionsResult.data ?? []).map((session) => ({
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
      messages: (messagesBySessionId.get(session.id) ?? []).map((m) => ({
        id: m.id,
        session_id: m.session_id,
        role: m.role,
        content: m.content,
        feedback: isInterviewQuestionFeedback(m.feedback) ? m.feedback : null,
        created_at: m.created_at,
      })),
    })),
  };
}

export async function getInterviewSessionPracticeState(
  sessionId: string,
): Promise<InterviewActionResult<InterviewSessionPracticeState>> {
  if (!UUID_PATTERN.test(sessionId.trim())) {
    return { ok: false, error: "Interview session not found." };
  }

  const user = await getAuthenticatedInterviewUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .eq("user_id", user.data)
    .maybeSingle<InterviewSession>();

  if (sessionError || !session) {
    return { ok: false, error: "Interview session not found." };
  }

  const { data: messages, error: messagesError } = await supabase
    .from("interview_messages")
    .select(MESSAGE_SELECT)
    .eq("session_id", session.id)
    .eq("user_id", user.data)
    .order("created_at", { ascending: true })
    .returns<InterviewMessage[]>();

  if (messagesError) {
    return { ok: false, error: "Could not load interview practice." };
  }

  const allMessages = messages ?? [];
  const answersByQuestionId = new Map<string, InterviewMessage>();
  const feedbackByQuestionId = new Map<string, InterviewMessage>();

  for (const message of allMessages) {
    if (message.role === "user" && isInterviewAnswerFeedback(message.feedback)) {
      answersByQuestionId.set(message.feedback.question_message_id, message);
    }

    if (message.role === "assistant" && isInterviewAiFeedback(message.feedback)) {
      feedbackByQuestionId.set(message.feedback.question_message_id, message);
    }
  }

  const questions = allMessages
    .filter(
      (message) =>
        message.role === "assistant" && isInterviewQuestionFeedback(message.feedback),
    )
    .map((message) => {
      const questionFeedback = message.feedback as InterviewQuestionMessageFeedback;
      const answer = answersByQuestionId.get(message.id) ?? null;
      const feedbackMessage = feedbackByQuestionId.get(message.id) ?? null;
      const aiFeedback = feedbackMessage?.feedback;

      return {
        id: message.id,
        session_id: message.session_id,
        question: message.content,
        topic: questionFeedback.topic,
        difficulty: questionFeedback.difficulty,
        order_index: questionFeedback.order_index,
        answered: Boolean(answer),
        answer: answer
          ? {
              id: answer.id,
              content: answer.content,
              created_at: answer.created_at,
            }
          : null,
        feedback:
          feedbackMessage && isInterviewAiFeedback(aiFeedback)
            ? {
                id: feedbackMessage.id,
                strengths: aiFeedback.strengths,
                missing_points: aiFeedback.missing_points,
                improved_answer: aiFeedback.improved_answer,
                score: aiFeedback.score,
                next_practice_tip: aiFeedback.next_practice_tip,
                created_at: feedbackMessage.created_at,
              }
            : null,
      };
    })
    .sort((a, b) => a.order_index - b.order_index);

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
      questions,
      completed_question_count: questions.filter((question) => question.answered).length,
      total_question_count: questions.length,
    },
  };
}