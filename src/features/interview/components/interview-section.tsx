"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { generateInterviewQuestions } from "@/lib/interviews/actions";
import type {
  InterviewGenerationInput,
  InterviewMessageFeedback,
  InterviewSessionView,
} from "@/types/interviews";
import type { MaterialRoadmapOption } from "@/types/materials";

import { InterviewGenerationForm } from "./interview-generation-form";

type InterviewSectionProps = {
  sessions: InterviewSessionView[];
  materials: MaterialRoadmapOption[];
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

const difficultyVariants: Record<string, BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

function formatDifficulty(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InterviewQuestionList({ session }: { session: InterviewSessionView }) {
  return (
    <article className="brutal-card grid gap-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{session.topic}</Badge>
            <Badge variant={difficultyVariants[session.difficulty] ?? "neutral"}>
              {formatDifficulty(session.difficulty)}
            </Badge>
            <Badge variant="neutral">
              {session.messages.length}{" "}
              {session.messages.length === 1 ? "question" : "questions"}
            </Badge>
          </div>
          <h3 className="mt-3 font-heading text-2xl font-black leading-tight">
            {session.topic} - Mock Interview
          </h3>
          <p className="mt-2 text-sm font-semibold text-zinc-600">
            Generated {formatSessionDate(session.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {session.messages.map((msg) => {
          const meta = msg.feedback as InterviewMessageFeedback | null;

          return (
            <div
              className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm"
              key={msg.id}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {meta?.topic ? <Badge variant="neutral">{meta.topic}</Badge> : null}
                  {meta?.difficulty ? (
                    <Badge variant={difficultyVariants[meta.difficulty] ?? "neutral"}>
                      {formatDifficulty(meta.difficulty)}
                    </Badge>
                  ) : null}
                </div>
                {meta?.order_index != null ? (
                  <span className="text-xs font-black text-zinc-500">
                    Q{meta.order_index} / {session.messages.length}
                  </span>
                ) : null}
              </div>

              <p className="font-heading text-lg font-black leading-snug">
                {msg.content}
              </p>

              {meta?.expected_answer_points &&
              meta.expected_answer_points.length > 0 ? (
                <div className="mt-3 rounded-md border-2 border-black bg-accent-blue px-3 py-2.5">
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Key points to cover
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {meta.expected_answer_points.map((point, i) => (
                      <li
                        className="flex items-start gap-2 text-sm font-semibold leading-6"
                        key={i}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1 inline-block h-4 w-4 shrink-0 rounded border border-black bg-white text-center text-[10px] font-black leading-4"
                        >
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function InterviewSection({ sessions, materials }: InterviewSectionProps) {
  const router = useRouter();
  const [visibleSessions, setVisibleSessions] = useState(sessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [generating, setGenerating] = useState(false);
  const selectedSession =
    visibleSessions.find((session) => session.id === selectedSessionId) ??
    visibleSessions[0] ??
    null;

  async function handleGenerate(
    input: InterviewGenerationInput,
  ): Promise<boolean> {
    setFeedback(null);
    setGenerating(true);

    const result = await generateInterviewQuestions(input);

    setGenerating(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return false;
    }

    setVisibleSessions((currentSessions) => [
      result.data,
      ...currentSessions.filter((session) => session.id !== result.data.id),
    ]);
    setSelectedSessionId(result.data.id);
    setFeedback({
      variant: "success",
      title: "Interview questions generated and saved.",
      description: "The new interview session is selected below.",
    });
    router.refresh();
    return true;
  }

  return (
    <section aria-labelledby="interview-heading" className="grid gap-5">
      <div className="brutal-card p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)] xl:items-start">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">
              Day 6 generator
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="interview-heading"
            >
              Mock Interview
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Generate technical interview questions from your processed
              material. Practice explaining concepts clearly. Questions include
              expected answer points to guide your revision.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-accent-blue px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {visibleSessions.length}{" "}
                {visibleSessions.length === 1 ? "session" : "sessions"} saved
              </div>
              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {materials.length === 0
                  ? "No processed materials"
                  : `${materials.length} materials ready`}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-accent-blue p-4 shadow-brutal">
            <h3 className="font-heading text-xl font-black">Generate with AI</h3>
            <p className="mb-3 mt-1 text-sm font-semibold leading-6">
              Usage is checked before the AI call. Only saved sessions count as
              successful usage.
            </p>
            <InterviewGenerationForm
              materials={materials}
              onSubmit={handleGenerate}
              pending={generating}
            />
          </div>
        </div>
      </div>

      {feedback ? (
        <Toast
          description={feedback.description}
          title={feedback.title}
          variant={feedback.variant}
        />
      ) : null}

      {visibleSessions.length === 0 ? (
        <EmptyState
          accent="blue"
          description={
            materials.length === 0
              ? "Upload and process a material first to generate an interview session."
              : "Generate an interview session from a completed material. Each session includes questions with expected answer points to guide your practice."
          }
          title="No interview sessions yet."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          <aside className="brutal-card grid gap-3 p-4" aria-label="Interview sessions">
            <h3 className="font-heading text-xl font-black">Sessions</h3>
            {visibleSessions.map((session) => {
              const selected = session.id === selectedSession?.id;

              return (
                <button
                  aria-pressed={selected}
                  className={`rounded-lg border-2 border-black p-3 text-left shadow-brutal-sm transition hover:-translate-y-0.5 hover:shadow-brutal ${
                    selected ? "bg-accent-blue" : "bg-paper-base"
                  }`}
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  type="button"
                >
                  <span className="block font-heading text-base font-black leading-tight">
                    {session.topic}
                  </span>
                  <span className="mt-2 block text-xs font-black uppercase text-zinc-600">
                    {session.messages.length} questions - {formatSessionDate(session.created_at)}
                  </span>
                </button>
              );
            })}
          </aside>

          {selectedSession ? (
            <InterviewQuestionList session={selectedSession} />
          ) : null}
        </div>
      )}
    </section>
  );
}
