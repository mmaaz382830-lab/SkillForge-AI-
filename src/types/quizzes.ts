import type { DifficultyLevel } from "./app";

export type Quiz = {
  id: string;
  user_id: string;
  material_id: string | null;
  title: string;
  topic: string | null;
  difficulty: DifficultyLevel;
  question_count: number;
  created_at: string;
  updated_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  user_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic: string | null;
  difficulty: DifficultyLevel;
  order_index: number;
  created_at: string;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string | null;
};

export type SanitizedQuizQuestionForAttempt = Pick<
  QuizQuestion,
  | "id"
  | "quiz_id"
  | "question"
  | "options"
  | "topic"
  | "difficulty"
  | "order_index"
>;

export type QuizView = Omit<Quiz, "user_id"> & {
  questions: SanitizedQuizQuestionForAttempt[];
};

export type SanitizedQuizForAttempt = Omit<Quiz, "user_id"> & {
  questions: SanitizedQuizQuestionForAttempt[];
};

export type QuizAttemptSubmissionInput = {
  quizId: string;
  answers: Record<string, string>;
};

export type QuizAttemptSummary = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_count: number;
  completed_at: string | null;
  progress_warning?: string;
};

export type QuizAttemptReviewItem = {
  question_id: string;
  question: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string | null;
  topic: string | null;
  difficulty: DifficultyLevel;
};

export type QuizAttemptReview = QuizAttemptSummary & {
  weak_topics: string[];
  review_items: QuizAttemptReviewItem[];
};

export type QuizGenerationInput = {
  material_id?: string | null;
  topic?: string | null;
  difficulty?: DifficultyLevel;
  question_count?: number | null;
};

export type QuizActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };




