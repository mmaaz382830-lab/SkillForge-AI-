import "server-only";

import type { ProfilePlan } from "@/types/auth";

import { logApiEvent } from "@/lib/logging/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AiUsageLimitError } from "./errors";

export const AI_FEATURE_TYPES = [
  "chat",
  "roadmap",
  "flashcards",
  "quiz",
  "interview",
  "embeddings",
] as const;

export type AiFeatureType = (typeof AI_FEATURE_TYPES)[number];

export const AI_USAGE_LOG_STATUSES = ["success", "blocked", "error"] as const;

export type AiUsageLogStatus = (typeof AI_USAGE_LOG_STATUSES)[number];

export type UsageLimitPeriod = "day" | "month";

export type PlanLimit = {
  limit: number;
  period: UsageLimitPeriod;
};

export type AiUsageStatus = {
  plan: ProfilePlan;
  featureType: AiFeatureType;
  used: number;
  limit: number;
  remaining: number;
  period: UsageLimitPeriod;
  periodKey: string;
  allowed: boolean;
  safeMessage?: string;
};

export type UsageSummaryItem = AiUsageStatus;

export type UsageSummary = {
  plan: ProfilePlan;
  userId: string | null;
  items: UsageSummaryItem[];
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

export const LIMIT_REACHED_MESSAGE =
  "You reached the limit for now. Please try again later.";

export const PLAN_USAGE_LIMITS = {
  free: {
    roadmap: { limit: 3, period: "month" },
    flashcards: { limit: 5, period: "month" },
    quiz: { limit: 5, period: "month" },
    interview: { limit: 5, period: "month" },
    chat: { limit: 20, period: "day" },
    embeddings: { limit: 5, period: "month" },
  },
  pro: {
    roadmap: { limit: 50, period: "month" },
    flashcards: { limit: 100, period: "month" },
    quiz: { limit: 100, period: "month" },
    interview: { limit: 100, period: "month" },
    chat: { limit: 500, period: "day" },
    embeddings: { limit: 100, period: "month" },
  },
  demo_admin: {
    roadmap: { limit: 9999, period: "month" },
    flashcards: { limit: 9999, period: "month" },
    quiz: { limit: 9999, period: "month" },
    interview: { limit: 9999, period: "month" },
    chat: { limit: 9999, period: "day" },
    embeddings: { limit: 9999, period: "month" },
  },
} as const satisfies Record<ProfilePlan, Record<AiFeatureType, PlanLimit>>;

export const AI_USAGE_LIMITS = Object.fromEntries(
  Object.entries(PLAN_USAGE_LIMITS).map(([plan, limits]) => [
    plan,
    Object.fromEntries(
      Object.entries(limits).map(([featureType, config]) => [
        featureType,
        config.limit,
      ]),
    ),
  ]),
) as Record<ProfilePlan, Record<AiFeatureType, number>>;

const SAFE_USAGE_METADATA_KEYS = new Set([
  "material_id",
  "goal_id",
  "roadmap_id",
  "deck_id",
  "quiz_id",
  "session_id",
  "question_message_id",
  "requested_count",
  "generated_item_count",
  "question_count",
  "source_count",
  "difficulty",
  "retry_count",
  "duration_ms",
  "error_code",
  "chunk_count",
  "embedding_dimension",
  "embedding_model",
  "has_answer",
  "has_material",
  "insufficient_context",
  "step",
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

function getUsagePeriodKey(period: UsageLimitPeriod, date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  if (period === "day") {
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}`;
}

async function getCurrentUserId(
  supabase: SupabaseServerClient,
): Promise<string | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch {
    return null;
  }
}

export function getCurrentUsagePeriodKey(date = new Date()): string {
  return getUsagePeriodKey("month", date);
}

export function getCurrentDailyUsagePeriodKey(date = new Date()): string {
  return getUsagePeriodKey("day", date);
}

export function sanitizeUsageMetadata(metadata?: unknown): UsageMetadata {
  const sanitized = sanitizeUsageMetadataValue(metadata);

  return isPlainObject(sanitized) ? sanitized : {};
}

export async function getCurrentPlan(input?: {
  userId?: string | null;
  supabaseClient?: SupabaseServerClient;
}): Promise<{ userId: string | null; plan: ProfilePlan }> {
  const supabase = input?.supabaseClient ?? (await createSupabaseServerClient());
  const userId = input?.userId ?? (await getCurrentUserId(supabase));

  if (!userId) {
    return { userId: null, plan: "free" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle<{ plan: ProfilePlan | string | null }>();

  return {
    userId,
    plan: normalizePlan(profile?.plan),
  };
}

export function getPlanLimit(input: {
  plan?: ProfilePlan | string | null;
  featureType: AiFeatureType;
}): PlanLimit {
  const plan = normalizePlan(input.plan);
  return (PLAN_USAGE_LIMITS as Record<ProfilePlan, Record<AiFeatureType, PlanLimit>>)[plan][input.featureType];
}

export async function getUsageForPeriod(input: {
  userId: string;
  featureType: AiFeatureType;
  period: UsageLimitPeriod;
  periodKey?: string;
  supabaseClient?: SupabaseServerClient;
}): Promise<number | null> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const periodKey = input.periodKey ?? getUsagePeriodKey(input.period);

  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("feature_type", input.featureType)
    .eq("period_key", periodKey)
    .eq("status", "success");

  if (error) {
    return null;
  }

  return count ?? 0;
}

export async function getAiUsageStatus(input: {
  userId: string;
  featureType: AiFeatureType;
  periodKey?: string;
  supabaseClient?: SupabaseServerClient;
}): Promise<AiUsageStatus> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const { plan } = await getCurrentPlan({
    userId: input.userId,
    supabaseClient: supabase,
  });
  const planLimit = getPlanLimit({ plan, featureType: input.featureType });
  const periodKey = input.periodKey ?? getUsagePeriodKey(planLimit.period);
  const usedCount = await getUsageForPeriod({
    userId: input.userId,
    featureType: input.featureType,
    period: planLimit.period,
    periodKey,
    supabaseClient: supabase,
  });
  const used = usedCount ?? planLimit.limit;
  const remaining = Math.max(planLimit.limit - used, 0);

  return {
    plan,
    featureType: input.featureType,
    used,
    limit: planLimit.limit,
    remaining,
    period: planLimit.period,
    periodKey,
    allowed: used < planLimit.limit,
    safeMessage: used < planLimit.limit ? undefined : LIMIT_REACHED_MESSAGE,
  };
}

export async function checkUsageLimit(input: {
  userId?: string | null;
  featureType: AiFeatureType;
  periodKey?: string;
  metadata?: unknown;
  route?: string;
  supabaseClient?: SupabaseServerClient;
}): Promise<AiUsageStatus> {
  const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
  const current = await getCurrentPlan({
    userId: input.userId,
    supabaseClient: supabase,
  });

  if (!current.userId) {
    return {
      plan: current.plan,
      featureType: input.featureType,
      used: 0,
      limit: 0,
      remaining: 0,
      period: "month",
      periodKey: getCurrentUsagePeriodKey(),
      allowed: false,
      safeMessage: LIMIT_REACHED_MESSAGE,
    };
  }

  const usage = await getAiUsageStatus({
    userId: current.userId,
    featureType: input.featureType,
    periodKey: input.periodKey,
    supabaseClient: supabase,
  });

  if (usage.allowed) {
    return usage;
  }

  const metadata = {
    ...sanitizeUsageMetadata(input.metadata),
    error_code: BLOCKED_ERROR_CODE,
  };

  await logAiUsageEvent({
    userId: current.userId,
    featureType: input.featureType,
    status: "blocked",
    periodKey: usage.periodKey,
    errorCode: BLOCKED_ERROR_CODE,
    metadata,
    supabaseClient: supabase,
  });

  await logApiEvent({
    userId: current.userId,
    route: input.route ?? input.featureType,
    method: "server_action",
    featureType: input.featureType,
    status: "blocked",
    statusCode: 429,
    metadata,
    supabaseClient: supabase,
  });

  return {
    ...usage,
    allowed: false,
    safeMessage: LIMIT_REACHED_MESSAGE,
  };
}

export async function assertAiUsageAllowed(input: {
  userId: string;
  featureType: AiFeatureType;
  periodKey?: string;
  metadata?: unknown;
  route?: string;
  supabaseClient?: SupabaseServerClient;
}): Promise<AiUsageStatus> {
  const usage = await checkUsageLimit(input);

  if (usage.allowed) {
    return usage;
  }

  throw new AiUsageLimitError(LIMIT_REACHED_MESSAGE);
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
  const period = getPlanLimit({ featureType: input.featureType }).period;

  const { error } = await supabase.from("usage_logs").insert({
    user_id: input.userId,
    feature_type: input.featureType,
    status: input.status,
    period_key: input.periodKey ?? getUsagePeriodKey(period),
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

export async function recordUsageSuccess(input: {
  userId: string;
  featureType: AiFeatureType;
  periodKey?: string;
  provider?: "gemini";
  model?: string | null;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
}): Promise<UsageLogResult> {
  return logAiUsageEvent({
    ...input,
    status: "success",
  });
}

export async function getUsageSummary(input?: {
  userId?: string | null;
  supabaseClient?: SupabaseServerClient;
}): Promise<UsageSummary> {
  const supabase = input?.supabaseClient ?? (await createSupabaseServerClient());
  const current = await getCurrentPlan({
    userId: input?.userId,
    supabaseClient: supabase,
  });

  if (!current.userId) {
    return {
      userId: null,
      plan: current.plan,
      items: AI_FEATURE_TYPES.map((featureType) => {
        const limit = getPlanLimit({ plan: current.plan, featureType });

        return {
          plan: current.plan,
          featureType,
          used: 0,
          limit: limit.limit,
          remaining: limit.limit,
          period: limit.period,
          periodKey: getUsagePeriodKey(limit.period),
          allowed: true,
        };
      }),
    };
  }

  const items = await Promise.all(
    AI_FEATURE_TYPES.map((featureType) =>
      getAiUsageStatus({
        userId: current.userId!,
        featureType,
        supabaseClient: supabase,
      }),
    ),
  );

  return {
    userId: current.userId,
    plan: current.plan,
    items,
  };
}