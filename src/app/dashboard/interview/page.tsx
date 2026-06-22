import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { InterviewFeedbackPreview } from "@/features/interview/components/interview-feedback-preview";

export const metadata: Metadata = {
  title: `Mock Interview — ${siteConfig.name}`,
  description: "Practice technical interview questions generated from your own notes.",
};

/**
 * /dashboard/interview — Mock interview visual shell.
 * Static data only. No AI generation, no feedback logic.
 */
export default function InterviewPage() {
  return (
    <DashboardShell
      title="Mock Interview"
      description="Prepare technical explanations and practice interview questions from your own material."
      activePath={dashboardRoutes.interview}
      actions={
        <Button type="button" variant="primary" size="sm" aria-disabled="true">
          Start interview
        </Button>
      }
    >
      {/* Setup card */}
      <section className="brutal-card p-6" aria-label="Interview setup">
        <h2 className="mb-1 font-heading text-2xl font-black">
          Set up your interview
        </h2>
        <p className="mb-5 text-sm font-medium text-zinc-600">
          Choose a topic and difficulty. SkillForge AI will generate interview
          questions from your uploaded notes.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-2 font-black">
            <span className="text-sm">Topic</span>
            <input
              type="text"
              readOnly
              placeholder="e.g. JavaScript async"
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none placeholder:text-zinc-400"
            />
          </label>
          <label className="grid gap-2 font-black">
            <span className="text-sm">Difficulty</span>
            <select
              disabled
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none"
            >
              <option>Junior</option>
              <option>Mid-level</option>
              <option>Senior</option>
            </select>
          </label>
          <label className="grid gap-2 font-black">
            <span className="text-sm">Questions</span>
            <select
              disabled
              className="min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none"
            >
              <option>3</option>
              <option>5</option>
              <option>10</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              aria-disabled="true"
            >
              Start interview
            </Button>
          </div>
        </div>
      </section>

      {/* One question preview */}
      <section
        className="brutal-card overflow-hidden"
        aria-label="Interview question preview"
      >
        <div className="border-b-2 border-black bg-paper-muted px-5 py-4">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Question 1 of 3 · Mid-level
          </p>
          <h2 className="mt-1 font-heading text-xl font-black leading-tight">
            Explain how async/await differs from raw Promises in JavaScript.
            What are the tradeoffs?
          </h2>
        </div>
        <div className="p-5">
          <Textarea
            id="interview-answer"
            label="Your answer"
            readOnly
            placeholder="Type your answer here. Take your time — there is no timer in practice mode."
            className="min-h-40"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              aria-disabled="true"
            >
              Submit answer
            </Button>
            <Button
              type="button"
              variant="secondary"
              aria-disabled="true"
            >
              Skip question
            </Button>
          </div>
        </div>
      </section>

      {/* Feedback card preview */}
      <section aria-label="Interview feedback preview">
        <h2 className="mb-4 font-heading text-xl font-black">
          Feedback — designed preview
        </h2>
        <InterviewFeedbackPreview />
      </section>

      {/* Empty state */}
      <EmptyState
        title="No interview sessions yet."
        description="Upload your material and start a mock interview to practice technical explanations from your own notes."
        accent="pink"
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Start first interview
          </Button>
        }
      />
    </DashboardShell>
  );
}
