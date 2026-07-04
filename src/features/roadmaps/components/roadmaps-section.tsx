"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  createRoadmap,
  deleteRoadmap,
  generateAiRoadmap,
  updateRoadmap,
} from "@/lib/roadmaps/actions";
import type { MaterialRoadmapOption } from "@/types/materials";
import type {
  AiRoadmapGenerationInput,
  LearningGoalOption,
  RoadmapInput,
  RoadmapView,
} from "@/types/roadmaps";

import { AiRoadmapForm } from "./ai-roadmap-form";
import { RoadmapCard } from "./roadmap-card";
import { RoadmapForm } from "./roadmap-form";

type RoadmapsSectionProps = {
  goals: LearningGoalOption[];
  materials: MaterialRoadmapOption[];
  roadmaps: RoadmapView[];
  defaultRoadmapDifficulty?: AiRoadmapGenerationInput["difficulty"];
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

type PendingAction =
  | "generate"
  | "create"
  | `update:${string}`
  | `delete:${string}`
  | null;

export function RoadmapsSection({
  goals,
  materials,
  roadmaps,
  defaultRoadmapDifficulty = "beginner",
}: RoadmapsSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const creating = pendingAction === "create";
  const generating = pendingAction === "generate";

  async function handleGenerate(
    input: AiRoadmapGenerationInput,
  ): Promise<boolean> {
    setFeedback(null);
    setPendingAction("generate");

    const result = await generateAiRoadmap(input);

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
      title: "Roadmap generated and saved.",
      description: "Open the roadmap to review and complete the new tasks.",
    });
    router.refresh();
    return true;
  }

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
      description: "Open the roadmap to add and track tasks.",
    });
    router.refresh();
    setManualFormOpen(false);
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
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-zinc-500">
              Learning path
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="roadmaps-heading"
            >
              Roadmaps
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Generate a structured checklist from a processed material, a
              learning goal, a manual topic, or a focused combination of them.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border-2 border-black bg-accent-yellow px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"} saved
              </div>
              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {goals.length === 0
                  ? "No goals yet"
                  : `${goals.length} goals available`}
              </div>
              <div className="rounded-md border-2 border-black bg-accent-green px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {materials.length === 0
                  ? "No processed materials"
                  : `${materials.length} materials ready`}
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border-2 border-black bg-accent-yellow p-4 shadow-brutal">
            <h3 className="font-heading text-xl font-black">
              Generate with AI
            </h3>
            <p className="mb-3 mt-1 text-sm font-semibold leading-6">
              Usage is checked before the AI call. Only saved, valid roadmaps
              count as successful usage.
            </p>
            <AiRoadmapForm
              goals={goals}
              materials={materials}
              onSubmit={handleGenerate}
              pending={generating}
              defaultDifficulty={defaultRoadmapDifficulty}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black">
              Create manually
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-zinc-600">
              Use this when you want to write the roadmap yourself.
            </p>
          </div>
          <button
            aria-expanded={manualFormOpen}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-md border-2 border-black bg-paper-base px-4 py-2.5 text-sm font-black leading-none"
            onClick={() => setManualFormOpen((open) => !open)}
            type="button"
          >
            {manualFormOpen ? "Hide manual form" : "Create manually"}
          </button>
        </div>
        {manualFormOpen ? (
          <div className="mt-4 border-t-2 border-black pt-4">
            <RoadmapForm goals={goals} onSubmit={handleCreate} pending={creating} />
          </div>
        ) : null}
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
          description={
            goals.length === 0 && materials.length === 0
              ? "Create a learning goal or upload a material first to generate an AI roadmap."
              : "Create your first roadmap from a learning goal, a material, or manually."
          }
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