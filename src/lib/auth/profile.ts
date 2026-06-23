import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

import { AUTH_MESSAGES } from "./errors";

type EnsureProfileResult =
  | {
      success: true;
      profile: Profile;
    }
  | {
      success: false;
      message: string;
    };

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

function readUserMetadataValue(
  metadata: User["user_metadata"],
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function getProfileSeedFromUser(user: User) {
  return {
    id: user.id,
    email:
      user.email ??
      readUserMetadataValue(user.user_metadata, ["email"]) ??
      "",
    full_name: readUserMetadataValue(user.user_metadata, [
      "full_name",
      "name",
    ]),
    avatar_url: readUserMetadataValue(user.user_metadata, [
      "avatar_url",
      "picture",
    ]),
    last_active_at: new Date().toISOString(),
  };
}

export async function ensureProfileForUser(
  user: User,
  supabaseClient?: SupabaseServerClient,
): Promise<EnsureProfileResult> {
  const supabase = supabaseClient ?? (await createSupabaseServerClient());

  const { data: existingProfile, error: loadError } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,avatar_url,role,plan,last_active_at,created_at,updated_at",
    )
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (existingProfile) {
    const metadataFullName = readUserMetadataValue(user.user_metadata, [
      "full_name",
      "name",
    ]);
    const updatePayload: {
      last_active_at: string;
      full_name?: string;
    } = {
      last_active_at: new Date().toISOString(),
    };

    if (!existingProfile.full_name && metadataFullName) {
      updatePayload.full_name = metadataFullName;
    }

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select(
        "id,email,full_name,avatar_url,role,plan,last_active_at,created_at,updated_at",
      )
      .maybeSingle<Profile>();

    return {
      success: true,
      profile: updatedProfile ?? existingProfile,
    };
  }

  if (loadError) {
    return {
      success: false,
      message: AUTH_MESSAGES.profileError,
    };
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert(getProfileSeedFromUser(user))
    .select(
      "id,email,full_name,avatar_url,role,plan,last_active_at,created_at,updated_at",
    )
    .maybeSingle<Profile>();

  if (!insertError && insertedProfile) {
    return {
      success: true,
      profile: insertedProfile,
    };
  }

  const { data: raceLoadedProfile } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,avatar_url,role,plan,last_active_at,created_at,updated_at",
    )
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (raceLoadedProfile) {
    return {
      success: true,
      profile: raceLoadedProfile,
    };
  }

  return {
    success: false,
    message: AUTH_MESSAGES.profileError,
  };
}
