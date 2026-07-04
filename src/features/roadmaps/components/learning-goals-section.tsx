"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  createLearningGoal,
  deleteLearningGoal,
  updateLearningGoal,
} from "@/lib/roadmaps/actions";
import type { LearningGoalInput, LearningGoalView } from "@/types/roadmaps";

import { LearningGoalCard } from "./learning-goal-card";
import { LearningGoalForm } from "./learning-goal-form";

type LearningGoalsSectionProps = {
  goals: LearningGoalView[];
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

type PendingAction =
  | "create"
  | `update:${string}`
  | `delete:${string}`
  | null;

export function LearningGoalsSection({ goals }: LearningGoalsSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const creating = pendingAction === "create";

  async function handleCreate(input: LearningGoalInput): Promise<boolean> {
    setFeedback(null);
    setPendingAction("create");

    const result = await createLearningGoal(input);

    setPendingAction(null);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return false;
    }

    setFeedback({
      variant: "success",
      title: "Learning goal created.",
      description: "Roadmaps can connect to this goal next.",
    });
    router.refresh();
    return true;
  }

  async function handleUpdate(
    id: string,
    input: LearningGoalInput,
  ): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`update:${id}`);

    const result = await updateLearningGoal(id, input);

    setPendingAction(null);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return false;
    }

    setFeedback({
      variant: "success",
      title: "Learning goal updated.",
    });
    router.refresh();
    return true;
  }

  async function handleDelete(id: string): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`delete:${id}`);

    const result = await deleteLearningGoal(id);

    setPendingAction(null);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return false;
    }

    setFeedback({
      variant: "success",
      title: "Learning goal deleted.",
    });
    router.refresh();
    return true;
  }

  return (
    <section aria-labelledby="learning-goals-heading" className="grid gap-5">
      <div className="brutal-card bg-accent-yellow p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase">Learning path</p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="learning-goals-heading"
            >
              Learning goals
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Create a learning goal first. Roadmaps will connect to these goals
              next.
            </p>
            <div className="mt-4 rounded-md border-2 border-black bg-paper-base px-4 py-3 text-sm font-semibold shadow-brutal-sm">
              {goals.length} {goals.length === 1 ? "goal" : "goals"} saved
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal">
            <h3 className="mb-3 font-heading text-xl font-black">
              Create a goal
            </h3>
            <LearningGoalForm onSubmit={handleCreate} pending={creating} />
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

      {goals.length === 0 ? (
        <EmptyState
          accent="yellow"
          description="Create your first goal to start building a roadmap. Keep it specific enough that the next step can become a checklist."
          title="No learning goals yet."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => (
            <LearningGoalCard
              deleting={pendingAction === `delete:${goal.id}`}
              goal={goal}
              key={goal.id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              saving={pendingAction === `update:${goal.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
