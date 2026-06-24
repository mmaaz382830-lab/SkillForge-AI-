"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  createRoadmap,
  deleteRoadmap,
  updateRoadmap,
} from "@/lib/roadmaps/actions";
import type {
  LearningGoalOption,
  RoadmapInput,
  RoadmapView,
} from "@/types/roadmaps";

import { RoadmapCard } from "./roadmap-card";
import { RoadmapForm } from "./roadmap-form";

type RoadmapsSectionProps = {
  goals: LearningGoalOption[];
  roadmaps: RoadmapView[];
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

export function RoadmapsSection({ goals, roadmaps }: RoadmapsSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const creating = pendingAction === "create";

  async function handleCreate(input: RoadmapInput): Promise<boolean> {
    setFeedback(null);
    setPendingAction("create");

    const result = await createRoadmap(input);

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
      title: "Roadmap created.",
      description: "Task checklists connect in the next Day 4 prompt.",
    });
    router.refresh();
    return true;
  }

  async function handleUpdate(
    id: string,
    input: RoadmapInput,
  ): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`update:${id}`);

    const result = await updateRoadmap(id, input);

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
      title: "Roadmap updated.",
    });
    router.refresh();
    return true;
  }

  async function handleDelete(id: string): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`delete:${id}`);

    const result = await deleteRoadmap(id);

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
      title: "Roadmap deleted.",
    });
    router.refresh();
    return true;
  }

  return (
    <section aria-labelledby="roadmaps-heading" className="grid gap-5">
      <div className="brutal-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">
              Manual planning
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="roadmaps-heading"
            >
              Roadmaps
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Create a manual roadmap and connect it to a learning goal. AI
              generation comes later.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-accent-yellow px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"} saved
              </div>
              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {goals.length === 0
                  ? "No goals yet. Link one later."
                  : `${goals.length} goals available`}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-accent-yellow p-4 shadow-brutal">
            <h3 className="mb-3 font-heading text-xl font-black">
              Create a roadmap
            </h3>
            <RoadmapForm goals={goals} onSubmit={handleCreate} pending={creating} />
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

      {roadmaps.length === 0 ? (
        <EmptyState
          accent="yellow"
          description="Create your first roadmap from a learning goal, or start without a goal and link one later."
          title="No roadmaps yet."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {roadmaps.map((roadmap) => (
            <RoadmapCard
              deleting={pendingAction === `delete:${roadmap.id}`}
              goals={goals}
              key={roadmap.id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              roadmap={roadmap}
              saving={pendingAction === `update:${roadmap.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
