import "server-only";

import { requireAdminProfile } from "@/lib/admin/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminOverviewData {
  totalUsers: number;
  planDistribution: {
    free: number;
    pro: number;
    demo_admin: number;
  };
  roleDistribution: {
    user: number;
    admin: number;
    blocked: number;
  };
  usageEventsCount: number;
  apiLogCount: number;
  errorLogCount: number;
  recentErrors: Array<{
    id: string;
    user_id: string | null;
    category: string;
    safe_message: string;
    source: string | null;
    feature_type: string | null;
    severity: string;
    created_at: string;
  }>;
  recentApiLogs: Array<{
    id: string;
    user_id: string | null;
    route: string;
    method: string | null;
    feature_type: string | null;
    status: string;
    status_code: number | null;
    duration_ms: number | null;
    created_at: string;
  }>;
  recentAdminActions: Array<{
    id: string;
    admin_user_id: string | null;
    target_user_id: string | null;
    action: string;
    target_type: string | null;
    target_id: string | null;
    created_at: string;
  }>;
}

export interface AdminUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin" | "blocked";
  plan: "free" | "pro" | "demo_admin";
  created_at: string;
  last_active_at: string | null;
}

export interface AdminUsageLog {
  id: string;
  user_id: string | null;
  feature_type: string;
  status: string;
  period_key: string;
  created_at: string;
  profiles: {
    email: string;
  } | null;
}

export interface AdminLogsData {
  apiLogs: Array<{
    id: string;
    user_id: string | null;
    route: string;
    method: string | null;
    feature_type: string | null;
    status: string;
    status_code: number | null;
    duration_ms: number | null;
    created_at: string;
    profiles?: { email: string } | null;
  }>;
  errorLogs: Array<{
    id: string;
    user_id: string | null;
    category: string;
    safe_message: string;
    source: string | null;
    feature_type: string | null;
    severity: string;
    created_at: string;
    profiles?: { email: string } | null;
  }>;
  adminActions: Array<{
    id: string;
    admin_user_id: string | null;
    target_user_id: string | null;
    action: string;
    target_type: string | null;
    target_id: string | null;
    created_at: string;
    admin_profiles?: { email: string } | null;
    target_profiles?: { email: string } | null;
  }>;
}

const FALLBACK_OVERVIEW: AdminOverviewData = {
  totalUsers: 0,
  planDistribution: { free: 0, pro: 0, demo_admin: 0 },
  roleDistribution: { user: 0, admin: 0, blocked: 0 },
  usageEventsCount: 0,
  apiLogCount: 0,
  errorLogCount: 0,
  recentErrors: [],
  recentApiLogs: [],
  recentAdminActions: [],
};

export async function getAdminOverview(): Promise<AdminOverviewData> {
  try {
    // 1. Enforce admin role check first
    await requireAdminProfile();

    const supabase = await createSupabaseServerClient();

    // 2. Fetch total users & distribution
    // Note: To avoid querying full profile records, we select role and plan
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("role, plan");

    if (profilesError || !profiles) {
      console.error("[admin:getOverview:profiles]", profilesError);
      return FALLBACK_OVERVIEW;
    }

    const planDistribution = { free: 0, pro: 0, demo_admin: 0 };
    const roleDistribution = { user: 0, admin: 0, blocked: 0 };

    profiles.forEach((p) => {
      const plan = p.plan as keyof typeof planDistribution;
      const role = p.role as keyof typeof roleDistribution;

      if (plan in planDistribution) planDistribution[plan]++;
      if (role in roleDistribution) roleDistribution[role]++;
    });

    // 3. Fetch log counts
    const [usageCountRes, apiCountRes, errorCountRes] = await Promise.all([
      supabase.from("usage_logs").select("id", { count: "exact", head: true }),
      supabase.from("api_logs").select("id", { count: "exact", head: true }),
      supabase.from("error_logs").select("id", { count: "exact", head: true }),
    ]);

    // 4. Fetch recent logs for overview dashboard
    const [recentErrorsRes, recentApiLogsRes, recentAdminActionsRes] = await Promise.all([
      supabase
        .from("error_logs")
        .select("id, user_id, category, safe_message, source, feature_type, severity, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("api_logs")
        .select("id, user_id, route, method, feature_type, status, status_code, duration_ms, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("admin_actions")
        .select("id, admin_user_id, target_user_id, action, target_type, target_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return {
      totalUsers: profiles.length,
      planDistribution,
      roleDistribution,
      usageEventsCount: usageCountRes.count ?? 0,
      apiLogCount: apiCountRes.count ?? 0,
      errorLogCount: errorCountRes.count ?? 0,
      recentErrors: recentErrorsRes.data ?? [],
      recentApiLogs: recentApiLogsRes.data ?? [],
      recentAdminActions: recentAdminActionsRes.data ?? [],
    };
  } catch (err) {
    console.error("[admin:getOverview:catch]", err);
    return FALLBACK_OVERVIEW;
  }
}

export async function getAdminUsers(): Promise<AdminUserProfile[]> {
  try {
    await requireAdminProfile();

    const supabase = await createSupabaseServerClient();
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, plan, created_at, last_active_at")
      .order("created_at", { ascending: false });

    if (error || !users) {
      console.error("[admin:getUsers]", error);
      return [];
    }

    return users as AdminUserProfile[];
  } catch (err) {
    console.error("[admin:getUsers:catch]", err);
    return [];
  }
}

export async function getAdminUsageLogs(): Promise<AdminUsageLog[]> {
  try {
    await requireAdminProfile();

    const supabase = await createSupabaseServerClient();
    const { data: logs, error } = await supabase
      .from("usage_logs")
      .select("id, user_id, feature_type, status, period_key, created_at, profiles(email)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !logs) {
      console.error("[admin:getUsageLogs]", error);
      return [];
    }

    return logs as unknown as AdminUsageLog[];
  } catch (err) {
    console.error("[admin:getUsageLogs:catch]", err);
    return [];
  }
}

export async function getAdminLogs(): Promise<AdminLogsData> {
  try {
    await requireAdminProfile();

    const supabase = await createSupabaseServerClient();

    const [apiLogsRes, errorLogsRes, adminActionsRes] = await Promise.all([
      supabase
        .from("api_logs")
        .select("id, user_id, route, method, feature_type, status, status_code, duration_ms, created_at, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("error_logs")
        .select("id, user_id, category, safe_message, source, feature_type, severity, created_at, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("admin_actions")
        .select("id, admin_user_id, target_user_id, action, target_type, target_id, created_at, admin_profiles:profiles!admin_user_id(email), target_profiles:profiles!target_user_id(email)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return {
      apiLogs: (apiLogsRes.data ?? []) as unknown as AdminLogsData["apiLogs"],
      errorLogs: (errorLogsRes.data ?? []) as unknown as AdminLogsData["errorLogs"],
      adminActions: (adminActionsRes.data ?? []) as unknown as AdminLogsData["adminActions"],
    };
  } catch (err) {
    console.error("[admin:getLogs:catch]", err);
    return {
      apiLogs: [],
      errorLogs: [],
      adminActions: [],
    };
  }
}
