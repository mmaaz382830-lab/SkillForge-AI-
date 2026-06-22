import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UsageCard } from "@/features/dashboard/components/usage-card";
import { ProgressEventList } from "@/features/progress/components/progress-event-list";

export const metadata: Metadata = {
  title: `Progress — ${siteConfig.name}`,
  description: "Track your learning progress across roadmaps, quizzes, and flashcards.",
};

const SUMMARY_CARDS = [
  { label: "Tasks completed", value: "9 / 12", accent: "bg-accent-yellow" },
  { label: "Quiz average score", value: "77%", accent: "bg-accent-pink" },
  { label: "Flashcards reviewed", value: "45", accent: "bg-accent-green" },
  { label: "Interviews done", value: "2", accent: "bg-accent-pink" },
];

/**
 * /dashboard/progress — Progress visual shell.
 * Static data only. No real analytics, no data fetching.
 */
export default function ProgressPage() {
  return (
    <DashboardShell
      title="Progress"
      description="Your learning progress across roadmaps, quizzes, flashcards, and interviews."
      activePath={dashboardRoutes.progress}
    >
      {/* Summary cards */}
      <section aria-label="Progress summary">
        <h2 className="mb-4 font-heading text-xl font-black">
          Learning summary
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SUMMARY_CARDS.map((s) => (
            <div key={s.label} className="brutal-card p-5">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md border-2 border-black text-sm font-black shadow-brutal-sm ${s.accent}`}
                aria-hidden="true"
              >
                #
              </div>
              <p className="text-3xl font-black leading-none">{s.value}</p>
              <p className="mt-2 text-sm font-semibold text-zinc-600">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap progress preview */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Roadmap progress">
        <h2 className="mb-5 font-heading text-xl font-black">
          Roadmap completion
        </h2>
        <div className="grid gap-5">
          <Progress
            label="JavaScript Fundamentals"
            value={9}
            max={12}
            indicatorClassName="bg-accent-yellow"
            description="9 of 12 tasks completed."
          />
          <Progress
            label="Async/Await Patterns"
            value={3}
            max={7}
            indicatorClassName="bg-accent-yellow"
            description="3 of 7 tasks completed."
          />
          <Progress
            label="React Hooks in Practice"
            value={0}
            max={10}
            indicatorClassName="bg-accent-yellow"
            description="Not started yet."
          />
        </div>
      </section>

      {/* Quiz score preview */}
      <section className="brutal-card p-5 sm:p-6" aria-label="Quiz scores">
        <h2 className="mb-4 font-heading text-xl font-black">Quiz scores</h2>
        <div className="grid gap-3">
          {[
            { label: "JavaScript Promises Quiz", score: 8, total: 10 },
            { label: "React Hooks Practice", score: 6, total: 10 },
            { label: "Closures and Scope", score: 9, total: 10 },
          ].map((q) => (
            <div
              key={q.label}
              className="flex flex-col gap-2 rounded-md border-2 border-black bg-paper-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="text-sm font-semibold">{q.label}</span>
              <span
                className={`rounded-md border-2 border-black px-2 py-1 text-xs font-black shadow-brutal-sm ${
                  q.score / q.total >= 0.7
                    ? "bg-accent-green"
                    : "bg-accent-pink"
                }`}
              >
                {q.score}/{q.total}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent progress events + usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="brutal-card p-5 lg:col-span-2" aria-label="Recent learning events">
          <h2 className="mb-4 font-heading text-xl font-black">
            Learning history
          </h2>
          <ProgressEventList />
          <p className="mt-4 text-xs font-semibold text-zinc-400">
            Designed dashboard preview — real data connects in later phases.
          </p>
        </section>
        <UsageCard />
      </div>

      {/* Empty state */}
      <EmptyState
        title="No progress yet."
        description="Upload your first material, create a roadmap, and complete your first quiz to start tracking your learning progress."
        accent="green"
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Start learning
          </Button>
        }
      />
    </DashboardShell>
  );
}
