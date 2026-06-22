import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { ForgotPasswordFormShell } from "@/features/auth/components/forgot-password-form-shell";

export const metadata: Metadata = {
  title: `Reset password — ${siteConfig.name}`,
  description:
    "Reset your SkillForge AI password. Enter your email and we will send reset instructions.",
};

/**
 * /forgot-password — Auth visual shell page.
 * Static layout only. No real email sending, no Supabase, no backend route,
 * no server action, no redirect.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthCard>
        <AuthHeader
          title="Reset your password."
          subtitle="Enter your email address and we'll send you instructions to get back into your workspace."
        />
        <ForgotPasswordFormShell />
      </AuthCard>
    </AuthShell>
  );
}
