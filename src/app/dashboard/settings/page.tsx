import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: `Settings — ${siteConfig.name}`,
  description: "Manage your SkillForge AI account settings, plan, and preferences.",
};

function formatPlan(plan?: string | null) {
  if (!plan) {
    return "Unknown";
  }

  return plan
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  const displayName =
    profile?.full_name ||
    user?.user_metadata.full_name ||
    user?.user_metadata.name ||
    "";
  const plan = profile?.plan ?? "free";
  const formattedPlan = formatPlan(plan);

  return (
    <DashboardShell
      title="Settings"
      description="Manage your plan, usage, and account preferences."
      activePath={dashboardRoutes.settings}
    >
      {/* Plan / usage card */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Plan and usage">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Current plan
            </p>
            <h2 className="font-heading text-2xl font-black">
              {formattedPlan} plan
            </h2>
          </div>
          <div className="flex gap-2">
            <Badge variant="yellow">{formattedPlan}</Badge>
            <Badge variant="blue">{profile?.role ?? "user"}</Badge>
          </div>
        </div>
        <div className="mb-5 grid gap-4">
          <Progress
            label="AI generations"
            value={3}
            max={10}
            description="3 of 10 monthly AI generations used."
          />
          <Progress
            label="Materials"
            value={1}
            max={5}
            indicatorClassName="bg-accent-blue"
            description="1 of 5 free material uploads used."
          />
        </div>
        <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3">
          <p className="text-sm font-semibold">
            <span className="font-black">Pro plan</span> — unlimited AI
            generations, up to 50 materials, priority support. Coming in later
            phases.
          </p>
        </div>
        <div className="mt-4">
          <Button type="button" variant="highlight" aria-disabled="true">
            Upgrade to Pro
          </Button>
        </div>
      </section>

      {/* Preferences card */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Preferences">
        <h2 className="mb-4 font-heading text-xl font-black">Preferences</h2>
        <div className="grid gap-4">
          <label className="grid gap-2 font-black">
            <span className="text-sm">Display name</span>
            <input
              type="text"
              readOnly
              defaultValue={displayName || "Sign in to load your profile"}
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none"
            />
          </label>
          <label className="grid gap-2 font-black">
            <span className="text-sm">Default quiz difficulty</span>
            <select
              disabled
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none"
            >
              <option>Intermediate</option>
              <option>Beginner</option>
              <option>Advanced</option>
            </select>
          </label>
          <label className="grid gap-2 font-black">
            <span className="text-sm">Default roadmap difficulty</span>
            <select
              disabled
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
        </div>
        <div className="mt-5">
          <Button type="button" variant="primary" aria-disabled="true">
            Save preferences
          </Button>
        </div>
        <p className="mt-3 text-xs font-semibold text-zinc-400">
          Preference saving connects in later phases.
        </p>
      </section>

      {/* Danger zone */}
      <section
        className="rounded-xl border-2 border-state-error bg-paper-base p-5 shadow-brutal-sm sm:p-6"
        aria-label="Danger zone"
      >
        <h2 className="mb-2 font-heading text-xl font-black text-state-error">
          Danger zone
        </h2>
        <p className="mb-4 text-sm font-medium text-zinc-600">
          These are destructive account actions. They are visual placeholders
          — no action will be taken in Day 2.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            aria-disabled="true"
            className="border-state-error text-state-error hover:bg-accent-pink"
          >
            Delete all materials
          </Button>
          <Button
            type="button"
            variant="danger"
            aria-disabled="true"
          >
            Delete account
          </Button>
        </div>
      </section>
    </DashboardShell>
  );
}
