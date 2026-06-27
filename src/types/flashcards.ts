import type { DifficultyLevel } from "./app";

export type FlashcardDeck = {
  id: string;
  user_id: string;
  material_id: string | null;
  title: string;
  topic: string | null;
  card_count: number;
  created_at: string;
  updated_at: string;
};

export type Flashcard = {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
  topic: string | null;
  difficulty: DifficultyLevel;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type FlashcardDeckView = Omit<FlashcardDeck, "user_id"> & {
  cards: Array<Omit<Flashcard, "user_id">>;
};

export type FlashcardGenerationInput = {
  material_id?: string | null;
  topic?: string | null;
  difficulty?: DifficultyLevel;
  card_count?: number | null;
};

export type FlashcardActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };
