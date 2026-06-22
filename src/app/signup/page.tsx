import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { SignupFormShell } from "@/features/auth/components/signup-form-shell";

export const metadata: Metadata = {
  title: `Create account — ${siteConfig.name}`,
  description:
    "Create your SkillForge AI learning workspace. Turn today's notes into tomorrow's roadmap — start for free.",
};

/**
 * /signup — Auth visual shell page.
 * Static layout only. No real auth, no Supabase, no Google OAuth,
 * no profile creation, no redirect.
 */
export default function SignupPage() {
  return (
    <AuthShell>
      <AuthCard>
        <AuthHeader
          title="Create your learning workspace."
          subtitle="Turn today's notes into tomorrow's roadmap. Start building your personal study system."
        />
        <SignupFormShell />
      </AuthCard>
    </AuthShell>
  );
}
