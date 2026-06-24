import type {
  LearningGoalInput,
  RoadmapInput,
  RoadmapTaskInput,
  RoadmapTaskStatus,
} from "@/types/roadmaps";
import type { DifficultyLevel } from "@/types/app";

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

const TASK_STATUSES = new Set<RoadmapTaskStatus>([
  "todo",
  "in_progress",
  "completed",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_SHORT_TEXT_LENGTH = 120;
const MAX_DURATION_LENGTH = 80;

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

function validateRequiredTitle(
  value: string,
  requiredMessage: string,
): ValidationResult<string> {
  const title = value.trim();

  if (!title) {
    return {
      ok: false,
      error: requiredMessage,
    };
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    data: title,
  };
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

function validateOptionalUuid(
  value: string | null | undefined,
): ValidationResult<string | null> {
  const normalized = normalizeOptionalText(value, MAX_SHORT_TEXT_LENGTH);

  if (!normalized) {
    return {
      ok: true,
      data: null,
    };
  }

  if (!UUID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Invalid linked item.",
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

function validateOptionalDate(
  value: string | null | undefined,
): ValidationResult<string | null> {
  const normalized = normalizeOptionalText(value, MAX_SHORT_TEXT_LENGTH);

  if (!normalized) {
    return {
      ok: true,
      data: null,
    };
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== normalized
  ) {
    return {
      ok: false,
      error: "Target date must be a valid date.",
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

export function validateLearningGoalInput(
  input: LearningGoalInput,
): ValidationResult<Required<LearningGoalInput>> {
  const title = validateRequiredTitle(input.title, "Goal title is required.");

  if (!title.ok) {
    return title;
  }

  const difficulty = validateDifficulty(input.difficulty);

  if (!difficulty.ok) {
    return difficulty;
  }

  const targetDate = validateOptionalDate(input.target_date);

  if (!targetDate.ok) {
    return targetDate;
  }

  return {
    ok: true,
    data: {
      title: title.data,
      description: normalizeOptionalText(
        input.description,
        MAX_DESCRIPTION_LENGTH,
      ),
      category: normalizeOptionalText(input.category, MAX_SHORT_TEXT_LENGTH),
      difficulty: difficulty.data,
      target_date: targetDate.data,
    },
  };
}

export function validateRoadmapInput(
  input: RoadmapInput,
): ValidationResult<Required<RoadmapInput>> {
  const title = validateRequiredTitle(input.title, "Roadmap title is required.");

  if (!title.ok) {
    return title;
  }

  const difficulty = validateDifficulty(input.difficulty);

  if (!difficulty.ok) {
    return difficulty;
  }

  const goalId = validateOptionalUuid(input.goal_id);

  if (!goalId.ok) {
    return goalId;
  }

  return {
    ok: true,
    data: {
      title: title.data,
      description: normalizeOptionalText(
        input.description,
        MAX_DESCRIPTION_LENGTH,
      ),
      difficulty: difficulty.data,
      estimated_duration: normalizeOptionalText(
        input.estimated_duration,
        MAX_DURATION_LENGTH,
      ),
      goal_id: goalId.data,
    },
  };
}

export function validateRoadmapTaskInput(
  input: RoadmapTaskInput,
): ValidationResult<Required<RoadmapTaskInput>> {
  const title = validateRequiredTitle(input.title, "Task title is required.");

  if (!title.ok) {
    return title;
  }

  const status = input.status ?? "todo";

  if (!TASK_STATUSES.has(status)) {
    return {
      ok: false,
      error: "Task status must be todo, in_progress, or completed.",
    };
  }

  if (!Number.isInteger(input.order_index) || input.order_index < 0) {
    return {
      ok: false,
      error: "Task order must be a valid number.",
    };
  }

  return {
    ok: true,
    data: {
      title: title.data,
      description: normalizeOptionalText(
        input.description,
        MAX_DESCRIPTION_LENGTH,
      ),
      status,
      order_index: input.order_index,
      estimated_time: normalizeOptionalText(
        input.estimated_time,
        MAX_DURATION_LENGTH,
      ),
    },
  };
}

export function validateRoadmapTaskStatus(
  status: RoadmapTaskStatus,
): ValidationResult<RoadmapTaskStatus> {
  if (!TASK_STATUSES.has(status)) {
    return {
      ok: false,
      error: "Task status must be todo, in_progress, or completed.",
    };
  }

  return {
    ok: true,
    data: status,
  };
}
