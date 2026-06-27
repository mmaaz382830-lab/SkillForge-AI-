"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { EmptyState } from "@/components/states/empty-state";
import { generateQuiz } from "@/lib/quizzes/actions";
import type {
  QuizGenerationInput,
  QuizView,
} from "@/types/quizzes";
import type { MaterialRoadmapOption } from "@/types/materials";

import { QuizGenerationForm } from "./quiz-generation-form";

type QuizzesSectionProps = {
  quizzes: QuizView[];
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

export function QuizzesSection({ quizzes, materials }: QuizzesSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate(
    input: QuizGenerationInput,
  ): Promise<boolean> {
    setFeedback(null);
    setGenerating(true);

    const result = await generateQuiz(input);

    setGenerating(false);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return false;
    }

    setFeedback({
      variant: "success",
      title: "Quiz generated and saved.",
      description: "Review the questions in your quiz list below.",
    });
    router.refresh();
    return true;
  }

  return (
    <section aria-labelledby="quizzes-heading" className="grid gap-5">
      <div className="brutal-card p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)] xl:items-start">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">
              Day 6 generator
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="quizzes-heading"
            >
              Quizzes
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Turn processed material into multiple-choice quizzes. Each
              question includes the correct answer and explanation. Quizzes are
              tied to your own uploaded material.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-accent-pink px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}{" "}
                saved
              </div>
              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {materials.length === 0
                  ? "No processed materials"
                  : `${materials.length} materials ready`}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-accent-pink p-4 shadow-brutal">
            <h3 className="font-heading text-xl font-black">Generate with AI</h3>
            <p className="mb-3 mt-1 text-sm font-semibold leading-6">
              Usage is checked before the AI call. Only saved quizzes count as
              successful usage.
            </p>
            <QuizGenerationForm
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

      {quizzes.length === 0 ? (
        <EmptyState
          accent="pink"
          description={
            materials.length === 0
              ? "Upload and process a material first to generate quizzes."
              : "Generate a quiz from a completed material. Each question includes the correct answer and an explanation."
          }
          title="No quizzes yet."
        />
      ) : (
        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <article className="brutal-card grid gap-4 p-5" key={quiz.id}>
              {/* Quiz header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="pink">{quiz.topic ?? "Quiz"}</Badge>
                    <Badge
                      variant={
                        difficultyVariants[quiz.difficulty] ?? "neutral"
                      }
                    >
                      {formatDifficulty(quiz.difficulty)}
                    </Badge>
                    <Badge variant="neutral">
                      {quiz.question_count}{" "}
                      {quiz.question_count === 1 ? "question" : "questions"}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-heading text-2xl font-black leading-tight">
                    {quiz.title}
                  </h3>
                </div>
              </div>

              {/* Question preview list */}
              <div className="grid gap-3">
                {quiz.questions.map((q) => (
                  <div
                    className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm"
                    key={q.id}
                  >
                    {/* Question meta row */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="neutral">
                          {q.topic ?? quiz.topic ?? "Question"}
                        </Badge>
                        <Badge
                          variant={
                            difficultyVariants[q.difficulty] ?? "neutral"
                          }
                        >
                          {formatDifficulty(q.difficulty)}
                        </Badge>
                      </div>
                      <span className="text-xs font-black text-zinc-500">
                        Q{q.order_index} / {quiz.question_count}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="font-heading text-lg font-black leading-snug">
                      {q.question}
                    </p>

                    {/* Options */}
                    <div
                      className="mt-3 grid gap-2"
                      role="list"
                      aria-label="Answer options"
                    >
                      {q.options.map((option, i) => {
                        const isCorrect = option === q.correct_answer;

                        return (
                          <div
                            key={`${q.id}-opt-${i}`}
                            role="listitem"
                            className={`flex items-start gap-3 rounded-md border-2 border-black px-3 py-2.5 text-sm font-semibold shadow-brutal-sm ${
                              isCorrect
                                ? "bg-accent-green"
                                : "bg-paper-muted"
                            }`}
                            aria-label={`${isCorrect ? "Correct: " : ""}Option ${String.fromCharCode(65 + i)}: ${option}`}
                          >
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-black bg-white text-xs font-black">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                            {isCorrect ? (
                              <span className="ml-auto shrink-0 rounded border border-black bg-white px-1.5 py-0.5 text-xs font-black">
                                ✓
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3 rounded-md border-2 border-black bg-accent-pink px-3 py-2.5">
                      <p className="text-xs font-black uppercase text-zinc-600">
                        Explanation
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
