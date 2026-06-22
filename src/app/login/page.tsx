import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { LoginFormShell } from "@/features/auth/components/login-form-shell";

export const metadata: Metadata = {
  title: `Log in — ${siteConfig.name}`,
  description:
    "Log in to your SkillForge AI learning workspace. Continue building your personal learning system from your own notes.",
};

/**
 * /login — Auth visual shell page.
 * Static layout only. No real auth, no Supabase, no Google OAuth, no redirect.
 */
export default function LoginPage() {
  return (
    <AuthShell>
      <AuthCard>
        <AuthHeader
          title="Welcome back to your learning desk."
          subtitle="Log in to pick up where you left off and keep forging your skills."
        />
        <LoginFormShell />
      </AuthCard>
    </AuthShell>
  );
}
