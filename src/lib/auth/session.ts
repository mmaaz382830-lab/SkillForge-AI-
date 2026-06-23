import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session;
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,avatar_url,role,plan,last_active_at,created_at,updated_at",
    )
    .eq("id", userData.user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    return null;
  }

  return profile;
}
