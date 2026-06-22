import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { AuthCard } from "@/features/auth/components/auth-card";
import { CallbackState } from "@/features/auth/components/callback-state";

export const metadata: Metadata = {
  title: `Signing in — ${siteConfig.name}`,
  description: "Completing your sign in to SkillForge AI.",
};

/**
 * /auth/callback — Visual shell page only.
 * No route.ts. No OAuth code exchange. No search param reading for auth.
 * No Supabase client. No redirect. Static visual shell only.
 */
export default function AuthCallbackPage() {
  return (
    <AuthShell>
      <AuthCard className="max-w-sm">
        <CallbackState />
      </AuthCard>
    </AuthShell>
  );
}
