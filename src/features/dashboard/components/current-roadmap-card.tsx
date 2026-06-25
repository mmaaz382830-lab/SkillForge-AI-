import Link from "next/link";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dashboardRoutes } from "@/config/routes";
import type { DashboardRoadmapSummary } from "@/types/dashboard";

const difficultyVariant: Record<DashboardRoadmapSummary["difficulty"], BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

type CurrentRoadmapCardProps = {
  roadmap: DashboardRoadmapSummary | null;
};

export function CurrentRoadmapCard({ roadmap }: CurrentRoadmapCardProps) {
  if (!roadmap) {
    return (
      <section className="brutal-card grid gap-4 bg-paper-base p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Current roadmap
          </p>
          <h2 className="mt-2 font-heading text-2xl font-black leading-tight">
            No active roadmap yet.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-600">
            Create your first learning goal or roadmap to start tracking progress.
          </p>
        </div>
        <Link
          className="inline-flex w-fit items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href={dashboardRoutes.roadmaps}
        >
          Open roadmaps
        </Link>
      </section>
    );
  }

  return (
    <section className="brutal-card grid gap-5 bg-paper-base p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Current roadmap
          </p>
          <h2 className="mt-2 font-heading text-2xl font-black leading-tight">
            {roadmap.title}
          </h2>
          {roadmap.goal_title ? (
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              Linked goal: {roadmap.goal_title}
            </p>
          ) : null}
        </div>
        <Badge variant={difficultyVariant[roadmap.difficulty]}>
          {roadmap.difficulty}
        </Badge>
      </div>

      <div className="rounded-md border-2 border-black bg-paper-muted p-4 shadow-brutal-sm">
        <Progress
          description={`${roadmap.completed_task_count} of ${roadmap.task_count} roadmap tasks completed.`}
          indicatorClassName="bg-accent-green"
          label="Roadmap progress"
          value={roadmap.progress_percentage}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-zinc-700">
          {roadmap.completed_task_count}/{roadmap.task_count} tasks complete
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-4 py-2 text-sm font-black text-ink-text shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href={`${dashboardRoutes.roadmaps}/${roadmap.id}`}
        >
          Manage tasks
        </Link>
      </div>
    </section>
  );
}
