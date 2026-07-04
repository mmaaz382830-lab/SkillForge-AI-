import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import type { AiFeatureType } from "@/lib/ai/usage";
import { LIMIT_REACHED_MESSAGE } from "@/lib/ai/usage";
import { logApiEvent } from "@/lib/logging/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RateLimitFeature = AiFeatureType;

export type RateLimitReason =
  | "allowed"
  | "not_configured"
  | "blocked"
  | "error";

export type RateLimitConfig = {
  limit: number;
  window: "10 m";
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  message?: string;
  reason?: RateLimitReason;
  limit?: number;
  remaining?: number;
  reset?: Date;
};

type CheckRateLimitOptions = {
  userId?: string | null;
  route?: string;
  supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>;
};

export const RATE_LIMIT_CONFIG = {
  roadmap: { limit: 5, window: "10 m", windowSeconds: 10 * 60 },
  flashcards: { limit: 8, window: "10 m", windowSeconds: 10 * 60 },
  quiz: { limit: 8, window: "10 m", windowSeconds: 10 * 60 },
  interview: { limit: 10, window: "10 m", windowSeconds: 10 * 60 },
  chat: { limit: 20, window: "10 m", windowSeconds: 10 * 60 },
  embeddings: { limit: 5, window: "10 m", windowSeconds: 10 * 60 },
} as const satisfies Record<RateLimitFeature, RateLimitConfig>;

const UPSTASH_REDIS_REST_URL = "UPSTASH_REDIS_REST_URL";
const UPSTASH_REDIS_REST_TOKEN = "UPSTASH_REDIS_REST_TOKEN";

let redisClient: Redis | null = null;
const limiters = new Map<RateLimitFeature, Ratelimit>();

export function getRateLimitConfig(feature: RateLimitFeature): RateLimitConfig {
  return RATE_LIMIT_CONFIG[feature];
}

export function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env[UPSTASH_REDIS_REST_URL]?.trim() &&
      process.env[UPSTASH_REDIS_REST_TOKEN]?.trim(),
  );
}

async function getCurrentUserId(
  supabaseClient?: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<string | null> {
  const supabase = supabaseClient ?? (await createSupabaseServerClient());

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

function getRedisClient(): Redis | null {
  const url = process.env[UPSTASH_REDIS_REST_URL]?.trim();
  const token = process.env[UPSTASH_REDIS_REST_TOKEN]?.trim();

  if (!url || !token) {
    return null;
  }

  redisClient ??= new Redis({ url, token });

  return redisClient;
}

function getLimiter(feature: RateLimitFeature): Ratelimit | null {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  const cached = limiters.get(feature);

  if (cached) {
    return cached;
  }

  const config = getRateLimitConfig(feature);
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `skillforge:rate:${feature}`,
    analytics: false,
  });

  limiters.set(feature, limiter);

  return limiter;
}

function toResetDate(reset: number | undefined): Date | undefined {
  if (typeof reset !== "number" || !Number.isFinite(reset)) {
    return undefined;
  }

  return new Date(reset);
}

export async function checkRateLimit(
  feature: RateLimitFeature,
  options: CheckRateLimitOptions = {},
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(feature);
  const userId =
    options.userId ?? (await getCurrentUserId(options.supabaseClient));

  if (!userId) {
    return {
      allowed: false,
      reason: "blocked",
      message: LIMIT_REACHED_MESSAGE,
      limit: config.limit,
      remaining: 0,
    };
  }

  const configured = isRateLimitConfigured();

  if (!configured) {
    return {
      allowed: true,
      reason: "not_configured",
      limit: config.limit,
    };
  }

  const limiter = getLimiter(feature);

  if (!limiter) {
    return {
      allowed: true,
      reason: "not_configured",
      limit: config.limit,
    };
  }

  try {
    const result = await limiter.limit(`user:${userId}`);
    const reset = toResetDate(result.reset);

    if (result.success) {
      return {
        allowed: true,
        reason: "allowed",
        limit: result.limit,
        remaining: result.remaining,
        reset,
      };
    }

    await logApiEvent({
      userId,
      route: options.route ?? feature,
      method: "server_action",
      featureType: feature,
      status: "blocked",
      statusCode: 429,
      metadata: {
        reason: "rate_limit",
        configured: true,
        limit: result.limit,
        remaining: result.remaining,
      },
    });

    return {
      allowed: false,
      message: LIMIT_REACHED_MESSAGE,
      reason: "blocked",
      limit: result.limit,
      remaining: result.remaining,
      reset,
    };
  } catch (error) {
    console.warn("[rate-limit:error]", {
      feature,
      route: options.route ?? feature,
      userId,
      message:
        error instanceof Error
          ? error.message
          : "Rate limit check failed. Failing open.",
    });

    return {
      allowed: true,
      reason: "error",
      limit: config.limit,
    };
  }
}
