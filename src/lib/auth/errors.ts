export const AUTH_MESSAGES = {
  accountExists: "Account already exists.",
  checkEmail:
    "Check your email to confirm your account. If it does not arrive, check spam or your Supabase Auth email settings.",
  invalidCredentials: "Invalid email or password.",
  invalidEmail: "Please enter a valid email address.",
  invalidPassword: "Password must be at least 8 characters.",
  invalidFullName: "Full name must be 80 characters or fewer.",
  loginSuccess: "Signed in successfully.",
  logoutSuccess: "Signed out successfully.",
  googleCancelled: "Google sign-in was cancelled.",
  googleFailed: "Google sign-in failed. Please try again.",
  passwordResetSent: "If an account exists, reset instructions will be sent.",
  profileError: "Could not complete login. Please try again.",
  sessionExpired: "Session expired. Please log in again.",
  unknown: "Something went wrong. Please try again.",
} as const;

export type OAuthLoginErrorCode =
  | "google-cancelled"
  | "google-failed"
  | "callback-failed";

type ErrorLike = {
  message?: string;
  status?: number;
  code?: string;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as ErrorLike).message ?? "");
  }

  return "";
}

function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "status" in error) {
    return (error as ErrorLike).status;
  }

  return undefined;
}

export function mapAuthError(error: unknown): string {
  const message = getErrorMessage(error).toLowerCase();
  const status = getErrorStatus(error);

  if (
    status === 400 &&
    (message.includes("invalid login credentials") ||
      message.includes("invalid credentials"))
  ) {
    return AUTH_MESSAGES.invalidCredentials;
  }

  if (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already")
  ) {
    return AUTH_MESSAGES.accountExists;
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("not confirmed")
  ) {
    return AUTH_MESSAGES.checkEmail;
  }

  if (
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("refresh token")
  ) {
    return AUTH_MESSAGES.sessionExpired;
  }

  return AUTH_MESSAGES.unknown;
}

export function getOAuthErrorCode(
  error?: string | null,
  errorDescription?: string | null,
): OAuthLoginErrorCode {
  const normalized = `${error ?? ""} ${errorDescription ?? ""}`.toLowerCase();

  if (
    normalized.includes("access_denied") ||
    normalized.includes("cancel")
  ) {
    return "google-cancelled";
  }

  return "google-failed";
}

export function getOAuthLoginErrorMessage(
  code?: string | string[] | null,
): string | null {
  const value = Array.isArray(code) ? code[0] : code;

  if (value === "google-cancelled") {
    return AUTH_MESSAGES.googleCancelled;
  }

  if (value === "google-failed") {
    return AUTH_MESSAGES.googleFailed;
  }

  if (value === "callback-failed") {
    return AUTH_MESSAGES.profileError;
  }

  return null;
}
