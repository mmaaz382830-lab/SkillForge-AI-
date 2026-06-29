import { z } from "zod";

import type { DifficultyLevel } from "@/types/app";
import type {
  InterviewAnswerSubmissionInput,
  InterviewGenerationInput,
} from "@/types/interviews";

type ValidatedInterviewGenerationInput = {
  material_id: string;
  topic_focus: string | null;
  difficulty: DifficultyLevel;
  question_count: number;
};

type ValidatedInterviewAnswerSubmissionInput = {
  sessionId: string;
  questionMessageId: string;
  answer: string;
};

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const DIFFICULTIES = new Set<DifficultyLevel>([
  "beginner",
  "intermediate",
  "advanced",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const EMPTY_INTERVIEW_ANSWER_MESSAGE =
  "Please enter an answer first so I can give useful feedback.";

const coercedStringArray = z.preprocess(
  (val) => (Array.isArray(val) ? val : []),
  z.array(z.string().trim()).transform((arr) => arr.filter((s) => s.length > 0)),
);

const coercedScore = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}, z.number().min(0).max(10));

// Permissive schema that accepts both snake_case and camelCase Gemini variants.
// After parsing, field names are normalized to snake_case.
export const interviewFeedbackSchema = z
  .object({
    strengths: coercedStringArray.optional(),
    missing_points: coercedStringArray.optional(),
    missingPoints: coercedStringArray.optional(),
    improved_answer: z.string().trim().optional(),
    improvedAnswer: z.string().trim().optional(),
    score: coercedScore.optional(),
    next_practice_tip: z.string().trim().optional(),
    nextPracticeTip: z.string().trim().optional(),
  })
  .transform((raw) => {
    const strengths = raw.strengths ?? [];
    const missing_points = raw.missing_points ?? raw.missingPoints ?? [];
    const improved_answer =
      raw.improved_answer?.trim() || raw.improvedAnswer?.trim() || "No improved answer was provided.";
    const score = Math.max(0, Math.min(10, raw.score ?? 0));
    const next_practice_tip =
      raw.next_practice_tip?.trim() || raw.nextPracticeTip?.trim() || "Keep practising and revisit this topic.";

    return {
      strengths: strengths.length > 0 ? strengths : ["Answer was received."],
      missing_points: missing_points.length > 0 ? missing_points : ["Review the expected answer points for this question."],
      improved_answer,
      score,
      next_practice_tip,
    };
  });

const submitInterviewAnswerInputSchema = z.object({
  sessionId: z.string().uuid(),
  questionMessageId: z.string().uuid(),
  answer: z.string().trim().min(1, EMPTY_INTERVIEW_ANSWER_MESSAGE).max(8_000),
});

function normalizeOptionalText(
  value: string | null | undefined,
  maxLength: number,
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function validateRequiredUuid(
  value: string | null | undefined,
): ValidationResult<string> {
  const normalized = normalizeOptionalText(value, 120);
  if (!normalized || !UUID_PATTERN.test(normalized)) {
    return { ok: false, error: "Select a processed material first." };
  }
  return { ok: true, data: normalized };
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
  return { ok: true, data: difficulty };
}

export function validateInterviewAnswerSubmissionInput(
  input: InterviewAnswerSubmissionInput,
): ValidationResult<ValidatedInterviewAnswerSubmissionInput> {
  const parsed = submitInterviewAnswerInputSchema.safeParse(input);

  if (!parsed.success) {
    const answerIssue = parsed.error.issues.find((issue) =>
      issue.path.includes("answer"),
    );

    return {
      ok: false,
      error:
        answerIssue?.message === EMPTY_INTERVIEW_ANSWER_MESSAGE
          ? EMPTY_INTERVIEW_ANSWER_MESSAGE
          : "Submitted answer is invalid.",
    };
  }

  return {
    ok: true,
    data: parsed.data,
  };
}

export function validateInterviewGenerationInput(
  input: InterviewGenerationInput,
): ValidationResult<ValidatedInterviewGenerationInput> {
  const materialId = validateRequiredUuid(input.material_id);
  if (!materialId.ok) return materialId;

  const difficulty = validateDifficulty(input.difficulty);
  if (!difficulty.ok) return difficulty;

  const questionCount = input.question_count ?? 6;
  if (!Number.isInteger(questionCount) || questionCount < 5 || questionCount > 12) {
    return { ok: false, error: "Question count must be between 5 and 12." };
  }

  return {
    ok: true,
    data: {
      material_id: materialId.data,
      topic_focus: normalizeOptionalText(input.topic_focus, 120),
      difficulty: difficulty.data,
      question_count: questionCount,
    },
  };
}