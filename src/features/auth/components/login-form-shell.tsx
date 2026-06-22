import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthDivider } from "./auth-divider";
import { GoogleButton } from "./google-button";
import { publicRoutes } from "@/config/routes";

/**
 * LoginFormShell — static visual login form.
 * No real submit handler. No Supabase. No OAuth call. No redirect.
 * type="submit" is intentionally omitted from form — form has no action.
 * Server component — no client logic needed for visual shell.
 */
export function LoginFormShell() {
  return (
    <div className="grid gap-6">
      {/* Email / password fields */}
      <div className="grid gap-4">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          readOnly
          aria-describedby="login-email-helper"
        />
        <div className="grid gap-2">
          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            readOnly
          />
          <div className="text-right">
            <Link
              href={publicRoutes.forgotPassword}
              className="text-sm font-black underline decoration-2 underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        aria-disabled="true"
      >
        Log in
      </Button>

      {/* Divider */}
      <AuthDivider />

      {/* Google visual button */}
      <GoogleButton />

      {/* Footer link */}
      <p className="text-center text-sm font-semibold">
        No account yet?{" "}
        <Link
          href={publicRoutes.signup}
          className="font-black underline decoration-2 underline-offset-2"
        >
          Create your workspace
        </Link>
      </p>
    </div>
  );
}
