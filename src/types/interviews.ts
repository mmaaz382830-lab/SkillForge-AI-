import type { DifficultyLevel } from "./app";

/** Structured data stored in interview_messages.feedback jsonb */
export type InterviewMessageFeedback = {
  order_index: number;
  expected_answer_points: string[];
  difficulty: DifficultyLevel;
  topic: string | null;
};

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

/** View type — session with its generated question messages */
export type InterviewSessionView = Omit<InterviewSession, "user_id"> & {
  messages: Array<Omit<InterviewMessage, "user_id">>;
};

export type InterviewGenerationInput = {
  material_id?: string | null;
  topic?: string | null;
  difficulty?: DifficultyLevel;
  question_count?: number | null;
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
