import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { UsageCard } from "@/features/dashboard/components/usage-card";
import { DifficultyPreferencesForm } from "@/features/settings/components/difficulty-preferences-form";
import { getCurrentProfile } from "@/lib/auth/session";
import type { DifficultyLevel } from "@/types/app";

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

function getDifficultyPreference(value?: string | null): DifficultyLevel {
  if (value === "intermediate" || value === "advanced") {
    return value;
  }

  return "beginner";
}

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const plan = profile?.plan ?? "free";
  const formattedPlan = formatPlan(plan);
  const defaultQuizDifficulty = getDifficultyPreference(
    profile?.default_quiz_difficulty,
  );
  const defaultRoadmapDifficulty = getDifficultyPreference(
    profile?.default_roadmap_difficulty,
  );

  return (
    <DashboardShell
      title="Settings"
      description="Manage your learning preferences, usage, and plan details."
      activePath={dashboardRoutes.settings}
    >
      <section className="grid gap-4" aria-label="Plan and usage">
        <div className="brutal-card p-5 sm:p-6">
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
          <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3">
            <p className="text-sm font-semibold">
              Plan changes are admin-managed for this MVP. Usage below is
              calculated from successful AI actions in usage logs.
            </p>
          </div>
        </div>
        <UsageCard />
      </section>

      <section className="brutal-card p-5 sm:p-6" aria-label="Preferences">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Learning defaults
          </p>
          <h2 className="mt-2 font-heading text-xl font-black">
            Generator preferences
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-600">
            Set the difficulty that appears first when you generate quizzes and
            roadmaps. You can still change it inside each generator.
          </p>
        </div>
        <DifficultyPreferencesForm
          defaultQuizDifficulty={defaultQuizDifficulty}
          defaultRoadmapDifficulty={defaultRoadmapDifficulty}
        />
      </section>
    </DashboardShell>
  );
}