import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthMessage } from "./auth-message";
import { publicRoutes } from "@/config/routes";

/**
 * ForgotPasswordFormShell — static visual forgot-password form.
 * No real email sending. No Supabase. No backend route. No server action.
 * Server component — no client logic needed for visual shell.
 */
export function ForgotPasswordFormShell() {
  return (
    <div className="grid gap-6">
      {/* Informational placeholder message */}
      <AuthMessage variant="info" id="forgot-password-info">
        If an account exists with that email, reset instructions will be sent.
      </AuthMessage>

      {/* Email field */}
      <Input
        id="forgot-email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        readOnly
        aria-describedby="forgot-password-info"
      />

      {/* Primary CTA */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        aria-disabled="true"
      >
        Send reset instructions
      </Button>

      {/* Back link */}
      <p className="text-center text-sm font-semibold">
        <Link
          href={publicRoutes.login}
          className="font-black underline decoration-2 underline-offset-2"
        >
          ← Back to log in
        </Link>
      </p>
    </div>
  );
}
