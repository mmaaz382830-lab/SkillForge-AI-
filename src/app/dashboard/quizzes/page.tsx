import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { QuizPreviewCard } from "@/features/quizzes/components/quiz-preview-card";

export const metadata: Metadata = {
  title: `Quizzes — ${siteConfig.name}`,
  description: "Practice with AI-generated quizzes from your uploaded notes.",
};

const STATIC_ATTEMPTS = [
  {
    title: "JavaScript Promises Quiz",
    topic: "JavaScript",
    score: 8,
    total: 10,
    date: "Today",
  },
  {
    title: "React Hooks Practice",
    topic: "React",
    score: 6,
    total: 10,
    date: "Yesterday",
  },
  {
    title: "Closures and Scope",
    topic: "JavaScript",
    score: 9,
    total: 10,
    date: "3 days ago",
  },
];

const SAMPLE_OPTIONS = [
  { id: "a", text: "Runs Promises in sequence, returning first result" },
  { id: "b", text: "Runs all Promises in parallel, returns all results" },
  { id: "c", text: "Returns only the rejected Promise" },
  { id: "d", text: "Cancels other Promises once one resolves" },
];

/**
 * /dashboard/quizzes — Quizzes visual shell.
 * Static data only. No quiz attempt logic, no scoring logic.
 */
export default function QuizzesPage() {
  return (
    <DashboardShell
      title="Quizzes"
      description="Practice from your own notes with AI-generated multiple choice quizzes."
      activePath={dashboardRoutes.quizzes}
      actions={
        <Button type="button" variant="primary" size="sm" aria-disabled="true">
          Start quiz
        </Button>
      }
    >
      {/* Past attempts */}
      <section aria-label="Quiz history">
        <h2 className="mb-4 font-heading text-xl font-black">
          Recent attempts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_ATTEMPTS.map((attempt) => (
            <article key={attempt.title} className="brutal-card p-5">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="pink">{attempt.topic}</Badge>
                <Badge
                  variant={attempt.score / attempt.total >= 0.7 ? "success" : "warning"}
                >
                  {attempt.score}/{attempt.total}
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-black leading-tight">
                {attempt.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                {attempt.date}
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  aria-disabled="true"
                >
                  Review answers
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Focused question panel preview */}
      <section aria-label="Quiz question preview">
        <h2 className="mb-4 font-heading text-xl font-black">
          Quiz question — designed preview
        </h2>
        <div className="mx-auto max-w-2xl">
          <QuizPreviewCard
            topic="JavaScript"
            question="What does Promise.all() do when all Promises resolve successfully?"
            options={SAMPLE_OPTIONS}
            questionNumber={2}
            totalQuestions={10}
          />
        </div>
      </section>

      {/* Score summary preview */}
      <section
        className="brutal-card p-5 sm:p-6"
        aria-label="Score summary preview"
      >
        <h2 className="mb-4 font-heading text-xl font-black">
          Score summary — designed preview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Score", value: "8/10", accent: "bg-accent-green" },
            { label: "Correct", value: "8", accent: "bg-accent-green" },
            { label: "Wrong", value: "2", accent: "bg-accent-pink" },
            { label: "Time", value: "4m 22s", accent: "bg-accent-yellow" },
          ].map((s) => (
            <div key={s.label} className="brutal-card p-4 text-center">
              <p
                className={`mb-2 flex h-10 w-10 mx-auto items-center justify-center rounded-md border-2 border-black text-sm font-black shadow-brutal-sm ${s.accent}`}
                aria-hidden="true"
              >
                #
              </p>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-semibold text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Empty state */}
      <EmptyState
        title="No quiz attempts yet."
        description="Practice from your own notes with quizzes and interview prompts. Upload material first to generate quizzes."
        accent="pink"
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Start first quiz
          </Button>
        }
      />
    </DashboardShell>
  );
}
