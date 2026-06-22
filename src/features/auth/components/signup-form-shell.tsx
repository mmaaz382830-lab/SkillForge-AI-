import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthDivider } from "./auth-divider";
import { GoogleButton } from "./google-button";
import { publicRoutes } from "@/config/routes";

/**
 * SignupFormShell — static visual signup form.
 * No real submit handler. No Supabase. No profile creation. No redirect.
 * Server component — no client logic needed for visual shell.
 */
export function SignupFormShell() {
  return (
    <div className="grid gap-6">
      {/* Fields */}
      <div className="grid gap-4">
        <Input
          id="signup-name"
          label="Full name (optional)"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          readOnly
        />
        <Input
          id="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          readOnly
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          readOnly
          helperText="Use 8+ characters with a mix of letters and numbers."
          aria-describedby="signup-password-helper"
        />
      </div>

      {/* Helper copy */}
      <p className="rounded-md border-2 border-black bg-accent-yellow px-4 py-3 text-sm font-semibold">
        📚 Upload your notes, PDFs, or text — and build your personal learning
        roadmap from day one.
      </p>

      {/* Primary CTA */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        aria-disabled="true"
      >
        Create account
      </Button>

      {/* Divider */}
      <AuthDivider />

      {/* Google visual button */}
      <GoogleButton />

      {/* Footer link */}
      <p className="text-center text-sm font-semibold">
        Already have an account?{" "}
        <Link
          href={publicRoutes.login}
          className="font-black underline decoration-2 underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
