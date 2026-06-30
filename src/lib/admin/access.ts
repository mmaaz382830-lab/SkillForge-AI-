import { redirect } from "next/navigation";

import { adminRoutes, dashboardRoutes, publicRoutes } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

export type AdminProfile = Pick<Profile, "id" | "email" | "role" | "plan">;

const ADMIN_PROFILE_COLUMNS = "id,email,role,plan";

function getAdminBlockedRoute() {
  return `${dashboardRoutes.dashboard}?auth=required&reason=admin`;
}

function getLoginRoute() {
  const params = new URLSearchParams({
    redirectTo: adminRoutes.admin,
  });

  return `${publicRoutes.login}?${params.toString()}`;
}

export async function getCurrentAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(ADMIN_PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError || profile?.role !== "admin") {
    return null;
  }

  return profile;
}

export async function requireAdminProfile(): Promise<AdminProfile> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(getLoginRoute());
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(ADMIN_PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError || profile?.role !== "admin") {
    redirect(getAdminBlockedRoute());
  }

  return profile;
}