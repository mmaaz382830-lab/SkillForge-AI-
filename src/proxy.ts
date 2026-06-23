import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { adminRoutes, dashboardRoutes, publicRoutes } from "@/config/routes";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const AUTH_ENTRY_ROUTES = new Set<string>([
  publicRoutes.login,
  publicRoutes.signup,
]);

function isRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isDashboardRoute(pathname: string): boolean {
  return isRoute(pathname, dashboardRoutes.dashboard);
}

function isAdminRoute(pathname: string): boolean {
  return isRoute(pathname, adminRoutes.admin);
}

function isAuthCallbackRoute(pathname: string): boolean {
  return isRoute(pathname, publicRoutes.authCallback);
}

function createRedirectResponse(
  request: NextRequest,
  pathname: string,
  sourceResponse: NextResponse,
) {
  const response = NextResponse.redirect(new URL(pathname, request.url));

  sourceResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  return response;
}

function redirectToLogin(request: NextRequest, sourceResponse: NextResponse) {
  const loginUrl = new URL(publicRoutes.login, request.url);

  if (request.nextUrl.pathname.startsWith("/")) {
    loginUrl.searchParams.set(
      "redirectTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
  }

  const response = NextResponse.redirect(loginUrl);

  sourceResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { url, anonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isAuthCallbackRoute(pathname)) {
    return response;
  }

  if (AUTH_ENTRY_ROUTES.has(pathname) && user) {
    return createRedirectResponse(request, dashboardRoutes.dashboard, response);
  }

  if ((isDashboardRoute(pathname) || isAdminRoute(pathname)) && !user) {
    return redirectToLogin(request, response);
  }

  if (isAdminRoute(pathname) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string }>();

    if (profile?.role !== "admin") {
      return createRedirectResponse(
        request,
        `${dashboardRoutes.dashboard}?authError=admin-required`,
        response,
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/auth/callback",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
