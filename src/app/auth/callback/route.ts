import { NextResponse, type NextRequest } from "next/server";

import { dashboardRoutes, publicRoutes } from "@/config/routes";
import { getOAuthErrorCode } from "@/lib/auth/errors";
import { ensureProfileForUser } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectToLoginWithError(request: NextRequest, authError: string) {
  const url = new URL(publicRoutes.login, request.url);
  url.searchParams.set("authError", authError);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthErrorDescription =
    request.nextUrl.searchParams.get("error_description");

  if (oauthError) {
    return redirectToLoginWithError(
      request,
      getOAuthErrorCode(oauthError, oauthErrorDescription),
    );
  }

  if (!code) {
    return redirectToLoginWithError(request, "callback-failed");
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectToLoginWithError(request, "callback-failed");
  }

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    return redirectToLoginWithError(request, "callback-failed");
  }

  const dashboardUrl = new URL(dashboardRoutes.dashboard, request.url);
  const profileResult = await ensureProfileForUser(data.user, supabase);

  if (!profileResult.success) {
    dashboardUrl.searchParams.set("authError", "profile-unavailable");
  }

  return NextResponse.redirect(dashboardUrl);
}
