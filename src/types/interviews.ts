import type { DifficultyLevel } from "./app";

/** Structured data stored in interview_messages.feedback jsonb for generated questions. */
export type InterviewQuestionMessageFeedback = {
  order_index: number;
  expected_answer_points: string[];
  difficulty: DifficultyLevel;
  topic: string | null;
};

export type InterviewAnswerMessageFeedback = {
  type: "answer";
  question_message_id: string;
};

export type InterviewFeedback = {
  strengths: string[];
  missing_points: string[];
  improved_answer: string;
  score: number;
  next_practice_tip: string;
};

export type InterviewFeedbackMessageFeedback = InterviewFeedback & {
  type: "feedback";
  question_message_id: string;
};

export type InterviewMessageFeedback =
  | InterviewQuestionMessageFeedback
  | InterviewAnswerMessageFeedback
  | InterviewFeedbackMessageFeedback;

export type InterviewSession = {
  id: string;
  user_id: string;
  material_id: string | null;
  goal_id: string | null;
  topic: string;
  difficulty: DifficultyLevel;
  status: "active" | "completed" | "abandoned";
  overall_feedback: string | null;
  score: number | null;
  created_at: string;
  completed_at: string | null;
};

export type InterviewMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  feedback: InterviewMessageFeedback | null;
  created_at: string;
};

/** View type - session with generated question messages only. */
export type InterviewSessionView = Omit<InterviewSession, "user_id"> & {
  messages: Array<
    Omit<InterviewMessage, "user_id" | "feedback"> & {
      feedback: InterviewQuestionMessageFeedback | null;
    }
  >;
};

export type InterviewGenerationInput = {
  material_id?: string | null;
  topic_focus?: string | null;
  difficulty?: DifficultyLevel;
  question_count?: number | null;
};

export type InterviewQuestionForPractice = {
  id: string;
  session_id: string;
  question: string;
  topic: string | null;
  difficulty: DifficultyLevel;
  order_index: number;
  answered: boolean;
  answer: {
    id: string;
    content: string;
    created_at: string;
  } | null;
  feedback: (InterviewFeedback & {
    id: string;
    created_at: string;
  }) | null;
};

export type InterviewSessionPracticeState = Omit<InterviewSession, "user_id"> & {
  questions: InterviewQuestionForPractice[];
  completed_question_count: number;
  total_question_count: number;
};

export type InterviewAnswerSubmissionInput = {
  sessionId: string;
  questionMessageId: string;
  answer: string;
};

export type InterviewAnswerSubmissionResult = {
  session_id: string;
  question_message_id: string;
  answer_message_id: string;
  feedback_message_id: string;
  feedback: InterviewFeedback;
  completed: boolean;
  score: number | null;
  progress_warning?: string;
};

export type InterviewActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };