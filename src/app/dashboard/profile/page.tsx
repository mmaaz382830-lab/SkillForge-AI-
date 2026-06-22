import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `Profile — ${siteConfig.name}`,
  description: "Your SkillForge AI learning profile and account information.",
};

/**
 * /dashboard/profile — Profile visual shell.
 * Placeholder data only. No real user data, no profile update logic,
 * no logout, no Supabase.
 */
export default function ProfilePage() {
  return (
    <DashboardShell
      title="Profile"
      description="Your account details and learning identity."
      activePath={dashboardRoutes.profile}
    >
      {/* Profile card */}
      <section className="brutal-card p-6 sm:p-8" aria-label="Profile information">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar chip */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-accent-yellow font-heading text-3xl font-black shadow-brutal-sm"
            aria-label="User avatar"
          >
            DL
          </div>
          {/* Info */}
          <div className="grid gap-3">
            <div>
              <h2 className="font-heading text-3xl font-black leading-tight">
                Demo Learner
              </h2>
              <p className="mt-1 text-base font-semibold text-zinc-600">
                demo@example.com
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">User</Badge>
              <Badge variant="yellow">Free plan</Badge>
              <Badge variant="blue">Visual placeholder</Badge>
            </div>
            <p className="text-sm font-medium text-zinc-500">
              Member since Day 2 — real profile loads in later phases.
            </p>
          </div>
        </div>
      </section>

      {/* Account info card */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Account details">
        <h2 className="mb-4 font-heading text-xl font-black">
          Account details
        </h2>
        <div className="grid gap-3">
          {[
            { label: "Display name", value: "Demo Learner" },
            { label: "Email", value: "demo@example.com" },
            { label: "Role", value: "user" },
            { label: "Plan", value: "Free" },
            { label: "Account created", value: "Day 2 — visual placeholder" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 rounded-md border-2 border-black bg-paper-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-black uppercase tracking-wide text-zinc-500">
                {row.label}
              </span>
              <span className="text-sm font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Visual logout placeholder */}
      <section
        className="brutal-card border-state-error p-5 sm:p-6"
        aria-label="Account actions"
      >
        <h2 className="mb-2 font-heading text-xl font-black">Account actions</h2>
        <p className="mb-4 text-sm font-medium text-zinc-600">
          These controls are visual placeholders. Real account management connects in later phases.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            aria-disabled="true"
          >
            Edit profile
          </Button>
          <Button
            type="button"
            variant="secondary"
            aria-disabled="true"
          >
            Change password
          </Button>
          <Button
            type="button"
            variant="ghost"
            aria-disabled="true"
            className="text-state-error hover:bg-accent-pink"
          >
            Sign out
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
