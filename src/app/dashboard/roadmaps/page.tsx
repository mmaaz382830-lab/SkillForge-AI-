import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { RoadmapCard } from "@/features/roadmaps/components/roadmap-card";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: `Roadmaps — ${siteConfig.name}`,
  description: "Create and manage your AI-generated learning roadmaps.",
};

const STATIC_ROADMAPS = [
  {
    title: "JavaScript Fundamentals Mastery",
    difficulty: "Beginner" as const,
    estimatedDuration: "3 weeks",
    taskCount: 12,
    completedCount: 9,
  },
  {
    title: "Async/Await and Promises Deep Dive",
    difficulty: "Intermediate" as const,
    estimatedDuration: "1 week",
    taskCount: 7,
    completedCount: 3,
  },
  {
    title: "React Hooks in Practice",
    difficulty: "Intermediate" as const,
    estimatedDuration: "2 weeks",
    taskCount: 10,
    completedCount: 0,
  },
];

const STATIC_TASKS = [
  { id: "1", title: "Understand closure and scope", done: true, time: "30 min" },
  { id: "2", title: "Master the event loop", done: true, time: "45 min" },
  { id: "3", title: "Write 5 Promise chains", done: false, time: "1 hr" },
  { id: "4", title: "Compare async/await to callbacks", done: false, time: "30 min" },
];

/**
 * /dashboard/roadmaps — Roadmaps visual shell.
 * Static data only. No AI generation, no CRUD logic.
 */
export default function RoadmapsPage() {
  return (
    <DashboardShell
      title="Roadmaps"
      description="Your structured learning plans. Create a learning goal and generate your first roadmap."
      activePath={dashboardRoutes.roadmaps}
      actions={
        <Button type="button" variant="highlight" size="sm" aria-disabled="true">
          Create roadmap
        </Button>
      }
    >
      {/* Create goal visual card */}
      <section
        className="brutal-card p-6"
        aria-label="Create a learning goal"
      >
        <h2 className="mb-1 font-heading text-2xl font-black">
          Create a learning goal
        </h2>
        <p className="mb-4 text-sm font-medium text-zinc-600">
          Describe what you want to learn and SkillForge AI will generate a
          structured roadmap from your material.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 font-black">
            <span className="text-sm">Learning goal</span>
            <input
              type="text"
              readOnly
              placeholder="e.g. Master React hooks"
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none placeholder:text-zinc-400"
            />
          </label>
          <label className="grid gap-2 font-black">
            <span className="text-sm">Difficulty</span>
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
        <div className="mt-4">
          <Button type="button" variant="highlight" aria-disabled="true">
            Generate roadmap
          </Button>
        </div>
      </section>

      {/* Roadmap cards */}
      <section aria-label="Your roadmaps">
        <h2 className="mb-4 font-heading text-xl font-black">Your roadmaps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_ROADMAPS.map((r) => (
            <RoadmapCard key={r.title} {...r} />
          ))}
        </div>
      </section>

      {/* Checklist preview */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Roadmap task preview">
        <h2 className="mb-4 font-heading text-xl font-black">
          JavaScript Fundamentals — active tasks
        </h2>
        <Progress
          label="Overall progress"
          value={9}
          max={12}
          indicatorClassName="bg-accent-yellow"
          className="mb-5"
        />
        <ol className="grid gap-3" role="list">
          {STATIC_TASKS.map((task) => (
            <li
              key={task.id}
              className={`flex flex-col gap-2 rounded-md border-2 border-black px-4 py-3 font-semibold shadow-brutal-sm sm:flex-row sm:items-center sm:gap-3 ${
                task.done ? "bg-accent-green" : "bg-paper-base"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-black bg-paper-base text-xs font-black"
                  aria-hidden="true"
                >
                  {task.done ? "✓" : ""}
                </span>
                <span className={task.done ? "line-through opacity-70" : ""}>
                  {task.title}
                </span>
              </span>
              <span className="text-xs font-medium text-zinc-600 sm:ml-auto">
                {task.time}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Empty state */}
      <EmptyState
        title="No roadmaps yet."
        description="Create a learning goal and generate your first roadmap from your uploaded notes."
        accent="yellow"
        action={
          <Button type="button" variant="highlight" aria-disabled="true">
            Create first roadmap
          </Button>
        }
      />
    </DashboardShell>
  );
}
