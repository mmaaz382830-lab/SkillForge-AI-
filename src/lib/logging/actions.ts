import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { sanitizeMetadata } from "./sanitize";
import type {
  ErrorLogSeverity,
  LogFeatureType,
  LogResult,
  LogStatus,
} from "./types";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type LogApiEventInput = {
  route: string;
  method?: string | null;
  featureType?: LogFeatureType | null;
  status: LogStatus;
  statusCode?: number | null;
  durationMs?: number | null;
  userId?: string | null;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
};

type LogErrorEventInput = {
  category: string;
  safeMessage: string;
  source?: string | null;
  featureType?: LogFeatureType | null;
  severity?: ErrorLogSeverity;
  userId?: string | null;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
};

type LogAdminActionInput = {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  targetUserId?: string | null;
  metadata?: unknown;
  supabaseClient?: SupabaseServerClient;
};

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

async function getCurrentAdminUserId(
  supabase: SupabaseServerClient,
): Promise<string | null> {
  const userId = await getCurrentUserId(supabase);

  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle<{ role: string }>();

    if (error || data?.role !== "admin") {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

function normalizeOptionalNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function logApiEvent(input: LogApiEventInput): Promise<LogResult> {
  try {
    const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
    const currentUserId = await getCurrentUserId(supabase);
    const userId = currentUserId ?? input.userId ?? null;
    const { error } = await supabase.from("api_logs").insert({
      user_id: userId,
      route: input.route,
      method: input.method ?? "server_action",
      feature_type: input.featureType ?? null,
      status: input.status,
      status_code: normalizeOptionalNumber(input.statusCode),
      duration_ms: normalizeOptionalNumber(input.durationMs),
      metadata: sanitizeMetadata(input.metadata),
    });

    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function logErrorEvent(
  input: LogErrorEventInput,
): Promise<LogResult> {
  try {
    const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
    const currentUserId = await getCurrentUserId(supabase);
    const userId = currentUserId ?? input.userId ?? null;
    const { error } = await supabase.from("error_logs").insert({
      user_id: userId,
      category: input.category,
      safe_message: input.safeMessage,
      source: input.source ?? null,
      feature_type: input.featureType ?? null,
      severity: input.severity ?? "error",
      metadata: sanitizeMetadata(input.metadata),
    });

    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function logAdminAction(
  input: LogAdminActionInput,
): Promise<LogResult> {
  try {
    const supabase = input.supabaseClient ?? (await createSupabaseServerClient());
    const adminUserId = await getCurrentAdminUserId(supabase);

    if (!adminUserId) {
      return { ok: false };
    }

    const { error } = await supabase.from("admin_actions").insert({
      admin_user_id: adminUserId,
      target_user_id: input.targetUserId ?? null,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      metadata: sanitizeMetadata(input.metadata),
    });

    return error ? { ok: false } : { ok: true };
  } catch {
    return { ok: false };
  }
}

