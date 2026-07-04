"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicRoutes } from "@/config/routes";
import type { AuthActionResult } from "@/types/auth";

import { AUTH_MESSAGES, mapAuthError } from "./errors";
import { ensureProfileForUser } from "./profile";

type EmailPasswordInput = {
  email: string;
  password: string;
};

type SignupInput = EmailPasswordInput & {
  fullName?: string;
};

const DASHBOARD_ROUTE = "/dashboard";
const LOGIN_ROUTE = "/login";
const LOCAL_APP_ORIGIN = "http://localhost:3000";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFirstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function getSafeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
  } catch {
    return null;
  }

  return null;
}

async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const forwardedHost = getFirstHeaderValue(headerStore.get("x-forwarded-host"));
  const forwardedProto =
    getFirstHeaderValue(headerStore.get("x-forwarded-proto")) ?? "https";

  if (
    forwardedHost &&
    (forwardedProto === "http" || forwardedProto === "https")
  ) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = getFirstHeaderValue(headerStore.get("host"));

  if (host) {
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return getSafeOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? LOCAL_APP_ORIGIN;
}

function validateEmailPasswordInput(
  input: EmailPasswordInput,
): AuthActionResult | null {
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: AUTH_MESSAGES.invalidEmail,
    };
  }

  if (input.password.length < 8) {
    return {
      success: false,
      message: AUTH_MESSAGES.invalidPassword,
    };
  }

  return null;
}

function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function sanitizeFullName(fullName?: string): string | null {
  const trimmed = fullName?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

export async function signUpWithEmailPassword(
  input: SignupInput,
): Promise<AuthActionResult> {
  const validationError = validateEmailPasswordInput(input);

  if (validationError) {
    return validationError;
  }

  const supabase = await createSupabaseServerClient();
  const email = normalizeEmail(input.email);
  const fullName = sanitizeFullName(input.fullName);

  if (fullName && fullName.length > 80) {
    return {
      success: false,
      message: AUTH_MESSAGES.invalidFullName,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: fullName
      ? {
          data: {
            full_name: fullName,
            name: fullName,
          },
        }
      : undefined,
  });

  if (error) {
    return {
      success: false,
      message: mapAuthError(error),
    };
  }

  if (data.user) {
    await ensureProfileForUser(data.user);
  }

  return {
    success: true,
    message: AUTH_MESSAGES.checkEmail,
  };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const origin = await getRequestOrigin();
  const redirectTo = new URL(publicRoutes.authCallback, origin).toString();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect(`${LOGIN_ROUTE}?authError=google-failed`);
  }

  redirect(data.url);
}

export async function signInWithEmailPassword(
  input: EmailPasswordInput,
): Promise<AuthActionResult> {
  const validationError = validateEmailPasswordInput(input);

  if (validationError) {
    return validationError;
  }

  const supabase = await createSupabaseServerClient();
  const email = normalizeEmail(input.email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      message: error ? mapAuthError(error) : AUTH_MESSAGES.invalidCredentials,
    };
  }

  const profileResult = await ensureProfileForUser(data.user);

  if (!profileResult.success) {
    return {
      success: false,
      message: profileResult.message,
    };
  }

  return {
    success: true,
    message: AUTH_MESSAGES.loginSuccess,
    redirectTo: DASHBOARD_ROUTE,
  };
}

export async function signInWithEmailPasswordFormAction(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  return signInWithEmailPassword({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
  });
}

export async function signUpWithEmailPasswordFormAction(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  return signUpWithEmailPassword({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    fullName: readFormString(formData, "fullName"),
  });
}


export async function updateDisplayNameFormAction(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const fullName = sanitizeFullName(readFormString(formData, "fullName"));

  if (!fullName) {
    return {
      success: false,
      message: "Display name is required.",
    };
  }

  if (fullName.length > 80) {
    return {
      success: false,
      message: AUTH_MESSAGES.invalidFullName,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: AUTH_MESSAGES.sessionExpired,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      message: AUTH_MESSAGES.unknown,
    };
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      name: fullName,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    message: "Display name updated.",
  };
}

function isDifficultyPreference(value: string): value is "beginner" | "intermediate" | "advanced" {
  return ["beginner", "intermediate", "advanced"].includes(value);
}

export async function updateDifficultyPreferencesFormAction(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const defaultQuizDifficulty = readFormString(
    formData,
    "defaultQuizDifficulty",
  );
  const defaultRoadmapDifficulty = readFormString(
    formData,
    "defaultRoadmapDifficulty",
  );

  if (
    !isDifficultyPreference(defaultQuizDifficulty) ||
    !isDifficultyPreference(defaultRoadmapDifficulty)
  ) {
    return {
      success: false,
      message: "Choose valid difficulty preferences.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: AUTH_MESSAGES.sessionExpired,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      default_quiz_difficulty: defaultQuizDifficulty,
      default_roadmap_difficulty: defaultRoadmapDifficulty,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: AUTH_MESSAGES.unknown,
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/roadmaps");
  revalidatePath("/dashboard/quizzes");

  return {
    success: true,
    message: "Preferences saved.",
  };
}
export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      message: mapAuthError(error),
    };
  }

  return {
    success: true,
    message: AUTH_MESSAGES.logoutSuccess,
    redirectTo: LOGIN_ROUTE,
  };
}

export async function signOutAndRedirect(): Promise<void> {
  await signOut();
  redirect(LOGIN_ROUTE);
}

export async function requestPasswordReset(
  emailInput: string,
): Promise<AuthActionResult> {
  const email = normalizeEmail(emailInput);

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: AUTH_MESSAGES.invalidEmail,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return {
      success: true,
      message: AUTH_MESSAGES.passwordResetSent,
    };
  }

  return {
    success: true,
    message: AUTH_MESSAGES.passwordResetSent,
  };
}

export async function requestPasswordResetFormAction(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  return requestPasswordReset(readFormString(formData, "email"));
}
