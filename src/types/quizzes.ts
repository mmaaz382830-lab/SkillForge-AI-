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
  updated_at: string;
};

export type QuizView = Omit<Quiz, "user_id"> & {
  questions: Array<Omit<QuizQuestion, "user_id">>;
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
