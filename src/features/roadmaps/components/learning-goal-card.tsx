"use client";

import { useState } from "react";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LearningGoalInput, LearningGoalView } from "@/types/roadmaps";

import { LearningGoalForm } from "./learning-goal-form";

type LearningGoalCardProps = {
  goal: LearningGoalView;
  deleting?: boolean;
  saving?: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, input: LearningGoalInput) => Promise<boolean>;
};

const difficultyVariants: Record<LearningGoalView["difficulty"], BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

function formatDifficulty(value: LearningGoalView["difficulty"]): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function LearningGoalCard({
  goal,
  deleting = false,
  saving = false,
  onDelete,
  onUpdate,
}: LearningGoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const targetDate = formatDate(goal.target_date);
  const updatedDate = formatDate(goal.updated_at);

  async function handleUpdate(input: LearningGoalInput) {
    const saved = await onUpdate(goal.id, input);

    if (saved) {
      setEditing(false);
    }

    return saved;
  }

  async function handleDelete() {
    const deleted = await onDelete(goal.id);

    if (!deleted) {
      setConfirmingDelete(false);
    }

    return deleted;
  }

  return (
    <article className="brutal-card grid gap-4 p-5">
      {editing ? (
        <LearningGoalForm
          goal={goal}
          mode="edit"
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
          pending={saving}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-heading text-2xl font-black leading-tight">
                {goal.title}
              </h3>
              {goal.description ? (
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-700">
                  {goal.description}
                </p>
              ) : null}
            </div>
            <Badge variant={difficultyVariants[goal.difficulty]}>
              {formatDifficulty(goal.difficulty)}
            </Badge>
          </div>

          <dl className="grid gap-2 text-sm font-semibold sm:grid-cols-3">
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Category</dt>
              <dd>{goal.category || "Not set"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Target</dt>
              <dd>{targetDate ?? "No deadline"}</dd>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
              <dt className="text-xs font-black uppercase text-zinc-500">Updated</dt>
              <dd>{updatedDate ?? "Not available"}</dd>
            </div>
          </dl>

          {confirmingDelete ? (
            <div className="rounded-lg border-2 border-black bg-accent-pink p-4 shadow-brutal-sm" role="alert">
              <p className="font-black">Delete this learning goal?</p>
              <p className="mt-1 text-sm font-semibold leading-6">
                This removes the goal. Roadmaps linked to it will keep their data but lose the goal link.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button disabled={deleting} onClick={handleDelete} size="sm" type="button" variant="danger">
                  {deleting ? "Deleting..." : "Delete goal"}
                </Button>
                <Button disabled={deleting} onClick={() => setConfirmingDelete(false)} size="sm" type="button" variant="secondary">
                  Keep goal
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button disabled={saving || deleting} onClick={() => setEditing(true)} size="sm" type="button" variant="secondary">
                Edit
              </Button>
              <Button disabled={saving || deleting} onClick={() => setConfirmingDelete(true)} size="sm" type="button" variant="danger">
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
