import Link from "next/link";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dashboardRoutes } from "@/config/routes";
import type { RoadmapDetailView } from "@/types/roadmaps";

import { RoadmapTasksSection } from "./roadmap-tasks-section";

type RoadmapDetailProps = {
  roadmap: RoadmapDetailView;
};

const difficultyVariants: Record<RoadmapDetailView["difficulty"], BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

function formatDifficulty(value: RoadmapDetailView["difficulty"]): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function RoadmapDetail({ roadmap }: RoadmapDetailProps) {
  const completed = roadmap.progress.completed;
  const total = roadmap.progress.total;
  const percentage = roadmap.progress.percentage;

  return (
    <div className="grid gap-5">
      <div>
        <Link
          className="inline-flex min-h-10 items-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent-yellow hover:shadow-none"
          href={dashboardRoutes.roadmaps}
        >
          Back to roadmaps
        </Link>
      </div>

      <section className="brutal-card overflow-hidden">
        <div className="border-b-2 border-black bg-accent-yellow p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant={difficultyVariants[roadmap.difficulty]}>
                  {formatDifficulty(roadmap.difficulty)}
                </Badge>
                <Badge variant={roadmap.ai_generated ? "blue" : "yellow"}>
                  {roadmap.ai_generated ? "AI generated" : "Manual"}
                </Badge>
              </div>
              <h1 className="mt-4 max-w-4xl font-heading text-4xl font-black leading-none sm:text-5xl">
                {roadmap.title}
              </h1>
              {roadmap.description ? (
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 sm:text-lg">
                  {roadmap.description}
                </p>
              ) : null}
            </div>

            <div className="w-full rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm lg:max-w-64">
              <p className="text-xs font-black uppercase text-zinc-500">
                Progress
              </p>
              <p className="mt-1 font-heading text-4xl font-black">
                {percentage}%
              </p>
              <p className="mt-1 text-sm font-bold">
                {completed} of {total} tasks completed
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6">
          <Progress
            description={
              total === 0
                ? "Add tasks to start tracking progress."
                : `${completed} complete, ${Math.max(total - completed, 0)} left.`
            }
            indicatorClassName="bg-accent-green"
            label="Roadmap progress"
            max={100}
            value={percentage}
          />

          <dl className="grid gap-3 text-sm font-semibold md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 shadow-brutal-sm">
              <dt className="text-xs font-black uppercase text-zinc-500">
                Linked goal
              </dt>
              <dd className="mt-1">{roadmap.goal_title ?? "No linked goal"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 shadow-brutal-sm">
              <dt className="text-xs font-black uppercase text-zinc-500">
                Duration
              </dt>
              <dd className="mt-1">{roadmap.estimated_duration || "Not set"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-accent-green px-4 py-3 shadow-brutal-sm">
              <dt className="text-xs font-black uppercase">Completed</dt>
              <dd className="mt-1">{completed} tasks</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 shadow-brutal-sm">
              <dt className="text-xs font-black uppercase text-zinc-500">
                Total tasks
              </dt>
              <dd className="mt-1">{total} tasks</dd>
            </div>
          </dl>
        </div>
      </section>

      <RoadmapTasksSection roadmapId={roadmap.id} tasks={roadmap.tasks} />
    </div>
  );
}

