import type { Metadata } from "next";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Progress } from "@/components/ui/progress";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { DashboardStatCard } from "@/features/dashboard/components";
import { UsageCard } from "@/features/dashboard/components/usage-card";
import { ProgressEventList } from "@/features/progress/components/progress-event-list";
import { getDashboardProgress } from "@/lib/dashboard/queries";
import type { DashboardProgressSummary } from "@/types/dashboard";

export const metadata: Metadata = {
  title: `Progress - ${siteConfig.name}`,
  description: "Track your learning progress across roadmaps, quizzes, and interviews.",
};

export default async function ProgressPage() {
  const progressResult = await getDashboardProgress();

  return (
    <DashboardShell
      title="Progress"
      description="Your learning progress across roadmaps, quizzes, and interviews."
      activePath={dashboardRoutes.progress}
    >
      {!progressResult.ok ? (
        <ErrorState
          title="Could not load progress."
          description="Refresh the page or sign in again before checking your learning activity."
        />
      ) : (
        <ProgressContent data={progressResult.data} />
      )}
    </DashboardShell>
  );
}

type ProgressContentProps = {
  data: DashboardProgressSummary;
};

function ProgressContent({ data }: ProgressContentProps) {
  const hasProgress =
    data.completed_task_count > 0 ||
    data.quiz_attempt_count > 0 ||
    data.completed_interview_count > 0 ||
    data.recent_events.length > 0;

  return (
    <>
      <section aria-label="Progress summary">
        <h2 className="mb-4 font-heading text-xl font-black">
          Learning summary
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <DashboardStatCard
            accent="green"
            label="Tasks completed"
            value={`${data.completed_task_count} / ${data.roadmap_task_count}`}
          />
          <DashboardStatCard
            accent="pink"
            label="Quiz attempts"
            value={data.quiz_attempt_count}
          />
          <DashboardStatCard
            accent="pink"
            label="Latest quiz score"
            suffix={data.latest_quiz_score == null ? undefined : "%"}
            value={data.latest_quiz_score ?? "-"}
          />
          <DashboardStatCard
            accent="green"
            label="Interviews completed"
            value={data.completed_interview_count}
          />
        </div>
      </section>

      <section className="brutal-card p-5 sm:p-6" aria-label="Roadmap progress">
        <h2 className="mb-5 font-heading text-xl font-black">
          Roadmap completion
        </h2>
        <Progress
          label="All roadmap tasks"
          value={data.overall_progress_percentage}
          indicatorClassName="bg-accent-green"
          description={`${data.completed_task_count} of ${data.roadmap_task_count} roadmap tasks completed.`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section
          className="brutal-card p-5 lg:col-span-2"
          aria-label="Recent learning events"
        >
          <h2 className="mb-4 font-heading text-xl font-black">
            Learning history
          </h2>
          <ProgressEventList events={data.recent_events} />
        </section>
        <UsageCard />
      </div>

      {!hasProgress ? (
        <EmptyState
          title="No progress yet."
          description="Complete a roadmap task, submit a quiz attempt, or finish an interview session to start tracking real progress."
          accent="green"
          action={
            <Link
              className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              href={dashboardRoutes.dashboard}
            >
              Back to dashboard
            </Link>
          }
        />
      ) : null}
    </>
  );
}