import "server-only";

import type { ProfilePlan } from "@/types/auth";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AiUsageLimitError } from "./errors";

export const AI_FEATURE_TYPES = [
  "roadmap",
  "flashcards",
  "quiz",
  "interview",
] as const;

export type AiFeatureType = (typeof AI_FEATURE_TYPES)[number];

export const AI_USAGE_LOG_STATUSES = ["success", "blocked", "error"] as const;

export type AiUsageLogStatus = (typeof AI_USAGE_LOG_STATUSES)[number];

export type AiUsageStatus = {
  plan: ProfilePlan;
  featureType: AiFeatureType;
  used: number;
  limit: number;
  remaining: number;
  periodKey: string;
  allowed: boolean;
};

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type UsageMetadataValue =
  | string
  | number
  | boolean
  | null
  | UsageMetadataValue[]
  | { [key: string]: UsageMetadataValue };

export type UsageMetadata = Record<string, UsageMetadataValue>;

type UsageLogResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      errorCode: "USAGE_LOG_FAILED";
    };

export const AI_USAGE_LIMITS = {
  free: {
    roadmap: 5,
    flashcards: 10,
    quiz: 10,
    interview: 5,
  },
  pro: {
    roadmap: 100,
    flashcards: 200,
    quiz: 200,
    interview: 100,
  },
  demo_admin: {
    roadmap: 1000,
    flashcards: 1000,
    quiz: 1000,
    interview: 1000,
  },
} as const satisfies Record<ProfilePlan, Record<AiFeatureType, number>>;

const SAFE_USAGE_METADATA_KEYS = new Set([
  "material_id",
  "goal_id",
  "requested_count",
  "difficulty",
  "retry_count",
  "duration_ms",
  "error_code",
]);

const BLOCKED_ERROR_CODE = "USAGE_LIMIT_REACHED";

function normalizePlan(plan: unknown): ProfilePlan {
  if (plan === "pro" || plan === "demo_admin") {
    return plan;
  }

  return "free";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function sanitizeUsageMetadataValue(
  value: unknown,
): UsageMetadataValue | undefined {
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (Array.isArray(value)) {
    const sanitizedValues = value
      .map((item) => sanitizeUsageMetadataValue(item))
      .filter((item): item is UsageMetadataValue => item !== undefined);

    return sanitizedValues;
  }

  if (isPlainObject(value)) {
    const sanitizedObject: UsageMetadata = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (!SAFE_USAGE_METADATA_KEYS.has(key)) {
        continue;
      }

      const sanitizedValue = sanitizeUsageMetadataValue(nestedValue);

      if (sanitizedValue !== undefined) {
        sanitizedObject[key] = sanitizedValue;
      }
    }

    return sanitizedObject;
  }

  return undefined;
}

function logUsagePersistenceError(input: {
  userId: string;
  featureType: AiFeatureType;
  status: AiUsageLogStatus;
  error: unknown;
}) {
  const error =
    input.error && typeof input.error === "object"
      ? (input.error as { code?: string; message?: string })
      : null;

  console.error("[ai:usage-log:error]", {
    userId: input.userId,
    featureType: input.featureType,
    status: input.status,
    code: error?.code,
    message: error?.message ?? "Usage log insert failed.",
  });
}

export function getCurrentUsagePeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function sanitizeUsageMetadata(metadata?: unknown): UsageMetadata {
  const sanitized = sanitizeUsageMetadataValue(metadata);

  return isPlainObject(sanitized) ? sanitized : {};
}

export async function getAiUsageStatus(input: {
  userId: string;
  featureType: AiFeatureType;
  periodKey?: string;
  supabaseClient?: SupabaseServerClient;
}): Promise<AiUsageStatus> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const periodKey = input.periodKey ?? getCurrentUsagePeriodKey();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", input.userId)
    .maybeSingle<{ plan: ProfilePlan | string | null }>();

  const plan = normalizePlan(profile?.plan);
  const limit = AI_USAGE_LIMITS[plan][input.featureType];

  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("feature_type", input.featureType)
    .eq("period_key", periodKey)
    .eq("status", "success");

  const used = error ? limit : (count ?? 0);
  const remaining = Math.max(limit - used, 0);

  return {
    plan,
    featureType: input.featureType,
    used,
    limit,
    remaining,
    periodKey,
    allowed: used < limit,
  };
}

export async function assertAiUsageAllowed(input: {
  userId: string;
  featureType: AiFeatureType;
  periodKey?: string;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
}): Promise<AiUsageStatus> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const usage = await getAiUsageStatus({
    userId: input.userId,
    featureType: input.featureType,
    periodKey: input.periodKey,
    supabaseClient: supabase,
  });

  if (usage.allowed) {
    return usage;
  }

  await logAiUsageEvent({
    userId: input.userId,
    featureType: input.featureType,
    status: "blocked",
    periodKey: usage.periodKey,
    errorCode: BLOCKED_ERROR_CODE,
    metadata: {
      ...sanitizeUsageMetadata(input.metadata),
      error_code: BLOCKED_ERROR_CODE,
    },
    supabaseClient: supabase,
  });

  throw new AiUsageLimitError();
}

export async function logAiUsageEvent(input: {
  userId: string;
  featureType: AiFeatureType;
  status: AiUsageLogStatus;
  periodKey?: string;
  provider?: "gemini";
  model?: string | null;
  errorCode?: string | null;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
}): Promise<UsageLogResult> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const metadata = sanitizeUsageMetadata(input.metadata);

  const { error } = await supabase.from("usage_logs").insert({
    user_id: input.userId,
    feature_type: input.featureType,
    status: input.status,
    period_key: input.periodKey ?? getCurrentUsagePeriodKey(),
    provider: input.provider ?? "gemini",
    model: input.model ?? null,
    error_code: input.errorCode ?? null,
    metadata,
  });

  if (error) {
    logUsagePersistenceError({
      userId: input.userId,
      featureType: input.featureType,
      status: input.status,
      error,
    });

    return {
      ok: false,
      errorCode: "USAGE_LOG_FAILED",
    };
  }

  return {
    ok: true,
  };
}
