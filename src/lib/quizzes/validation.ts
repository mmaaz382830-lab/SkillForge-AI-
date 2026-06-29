import { z } from "zod";

import type { DifficultyLevel } from "@/types/app";
import type {
  QuizAttemptSubmissionInput,
  QuizGenerationInput,
} from "@/types/quizzes";

type ValidatedQuizGenerationInput = {
  material_id: string;
  topic: string | null;
  difficulty: DifficultyLevel;
  question_count: number;
};

type ValidatedQuizAttemptSubmissionInput = {
  quizId: string;
  answers: Record<string, string>;
};

type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

const DIFFICULTIES = new Set<DifficultyLevel>([
  "beginner",
  "intermediate",
  "advanced",
]);

const submitQuizAttemptInputSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.string().trim().min(1)),
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeOptionalText(
  value: string | null | undefined,
  maxLength: number,
): string | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function validateDifficulty(
  value: DifficultyLevel | undefined,
): ValidationResult<DifficultyLevel> {
  const difficulty = value ?? "beginner";

  if (!DIFFICULTIES.has(difficulty)) {
    return {
      ok: false,
      error: "Difficulty must be beginner, intermediate, or advanced.",
    };
  }

  return {
    ok: true,
    data: difficulty,
  };
}

function validateRequiredUuid(
  value: string | null | undefined,
): ValidationResult<string> {
  const normalized = normalizeOptionalText(value, 120);

  if (!normalized || !UUID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Select a processed material first.",
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

export function validateQuizAttemptSubmissionInput(
  input: QuizAttemptSubmissionInput,
): ValidationResult<ValidatedQuizAttemptSubmissionInput> {
  const parsed = submitQuizAttemptInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please answer at least one question.",
    };
  }

  const answers = Object.fromEntries(
    Object.entries(parsed.data.answers).map(([questionId, answer]) => [
      questionId,
      answer.trim(),
    ]),
  );

  if (Object.keys(answers).length === 0) {
    return {
      ok: false,
      error: "Please answer at least one question.",
    };
  }

  return {
    ok: true,
    data: {
      quizId: parsed.data.quizId,
      answers,
    },
  };
}

export function validateQuizGenerationInput(
  input: QuizGenerationInput,
): ValidationResult<ValidatedQuizGenerationInput> {
  const materialId = validateRequiredUuid(input.material_id);

  if (!materialId.ok) {
    return materialId;
  }

  const difficulty = validateDifficulty(input.difficulty);

  if (!difficulty.ok) {
    return difficulty;
  }

  const questionCount = input.question_count ?? 8;

  if (!Number.isInteger(questionCount) || questionCount < 5 || questionCount > 15) {
    return {
      ok: false,
      error: "Question count must be between 5 and 15.",
    };
  }

  return {
    ok: true,
    data: {
      material_id: materialId.data,
      topic: normalizeOptionalText(input.topic, 120),
      difficulty: difficulty.data,
      question_count: questionCount,
    },
  };
}

