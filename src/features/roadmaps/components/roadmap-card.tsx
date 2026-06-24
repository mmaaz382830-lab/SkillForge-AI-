"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  LearningGoalOption,
  RoadmapInput,
  RoadmapView,
} from "@/types/roadmaps";

import { RoadmapForm } from "./roadmap-form";

type RoadmapCardProps = {
  deleting?: boolean;
  goals: LearningGoalOption[];
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, input: RoadmapInput) => Promise<boolean>;
  roadmap: RoadmapView;
  saving?: boolean;
};

const difficultyVariants: Record<RoadmapView["difficulty"], BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

function formatDifficulty(value: RoadmapView["difficulty"]): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function RoadmapCard({
  deleting = false,
  goals,
  onDelete,
  onUpdate,
  roadmap,
  saving = false,
}: RoadmapCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleUpdate(input: RoadmapInput) {
    const saved = await onUpdate(roadmap.id, input);

    if (saved) {
      setEditing(false);
    }

    return saved;
  }

  async function handleDelete() {
    const deleted = await onDelete(roadmap.id);

    if (!deleted) {
      setConfirmingDelete(false);
    }

    return deleted;
  }

  return (
    <article className="brutal-card grid gap-4 p-5">
      {editing ? (
        <RoadmapForm
          goals={goals}
          mode="edit"
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
          pending={saving}
          roadmap={roadmap}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant={difficultyVariants[roadmap.difficulty]}>
                  {formatDifficulty(roadmap.difficulty)}
                </Badge>
                <Badge variant={roadmap.ai_generated ? "blue" : "yellow"}>
                  {roadmap.ai_generated ? "AI generated" : "Manual"}
                </Badge>
              </div>
              <h3 className="mt-3 font-heading text-2xl font-black leading-tight">
                {roadmap.title}
              </h3>
              {roadmap.description ? (
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-700">
                  {roadmap.description}
                </p>
              ) : null}
            </div>
            <div className="rounded-md border-2 border-black bg-accent-yellow px-3 py-2 text-center text-sm font-black shadow-brutal-sm">
              {roadmap.progress_percentage}%
              <span className="block text-[11px] uppercase">progress</span>
            </div>
          </div>

          <Progress
            indicatorClassName="bg-accent-yellow"
            label="Roadmap progress"
            max={100}
            value={roadmap.progress_percentage}
          />

          <dl className="grid gap-2 text-sm font-semibold sm:grid-cols-3">
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Goal</dt>
              <dd>{roadmap.goal_title ?? "No linked goal"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Duration</dt>
              <dd>{roadmap.estimated_duration || "Not set"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Tasks</dt>
              <dd>
                {roadmap.completed_task_count} / {roadmap.task_count} complete
              </dd>
            </div>
          </dl>


          {confirmingDelete ? (
            <div
              className="rounded-lg border-2 border-black bg-accent-pink p-4 shadow-brutal-sm"
              role="alert"
            >
              <p className="font-black">Delete this roadmap?</p>
              <p className="mt-1 text-sm font-semibold leading-6">
                This removes the roadmap and its tasks. Learning goals stay in
                place.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={deleting}
                  onClick={handleDelete}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  {deleting ? "Deleting..." : "Delete roadmap"}
                </Button>
                <Button
                  disabled={deleting}
                  onClick={() => setConfirmingDelete(false)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Keep roadmap
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={saving || deleting}
                onClick={() => setEditing(true)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Edit
              </Button>
              <Button
                disabled={saving || deleting}
                onClick={() => setConfirmingDelete(true)}
                size="sm"
                type="button"
                variant="danger"
              >
                Delete
              </Button>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border-2 border-black bg-accent-yellow px-3 py-2 text-sm font-black leading-none shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                href={`/dashboard/roadmaps/${roadmap.id}`}
              >
                Manage tasks
              </Link>
            </div>
          )}
        </>
      )}
    </article>
  );
}

