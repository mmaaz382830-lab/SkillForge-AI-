"use client";

import { useState } from "react";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type {
  RoadmapTaskInput,
  RoadmapTaskStatus,
  RoadmapTaskView,
} from "@/types/roadmaps";

import { RoadmapTaskForm } from "./roadmap-task-form";

type RoadmapTaskCardProps = {
  deleting?: boolean;
  onDelete: (taskId: string) => Promise<boolean>;
  onStatusUpdate: (
    taskId: string,
    status: RoadmapTaskStatus,
  ) => Promise<boolean>;
  onUpdate: (taskId: string, input: RoadmapTaskInput) => Promise<boolean>;
  saving?: boolean;
  statusPending?: RoadmapTaskStatus | null;
  task: RoadmapTaskView;
};

const statusCopy: Record<RoadmapTaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  completed: "Completed",
};

const statusVariants: Record<RoadmapTaskStatus, BadgeVariant> = {
  todo: "neutral",
  in_progress: "yellow",
  completed: "green",
};

function formatCompletedDate(value: string): string {
  return value.slice(0, 10);
}

export function RoadmapTaskCard({
  deleting = false,
  onDelete,
  onStatusUpdate,
  onUpdate,
  saving = false,
  statusPending = null,
  task,
}: RoadmapTaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const completed = task.status === "completed";
  const updatingStatus = statusPending !== null;

  async function handleUpdate(input: RoadmapTaskInput) {
    const saved = await onUpdate(task.id, input);

    if (saved) {
      setEditing(false);
    }

    return saved;
  }

  async function handleDelete() {
    const deleted = await onDelete(task.id);

    if (!deleted) {
      setConfirmingDelete(false);
    }

    return deleted;
  }

  return (
    <article
      className={cn(
        "brutal-card grid gap-4 p-4 sm:p-5",
        completed && "bg-accent-green",
      )}
    >
      {editing ? (
        <RoadmapTaskForm
          mode="edit"
          onCancel={() => setEditing(false)}
          onSubmit={handleUpdate}
          pending={saving}
          task={task}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-black bg-accent-yellow font-heading text-lg font-black shadow-brutal-sm">
                {task.order_index}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariants[task.status]}>
                    {statusCopy[task.status]}
                  </Badge>
                  {task.estimated_time ? (
                    <Badge variant="blue">{task.estimated_time}</Badge>
                  ) : null}
                </div>
                <h3
                  className={cn(
                    "mt-3 font-heading text-2xl font-black leading-tight",
                    completed && "line-through decoration-4",
                  )}
                >
                  {task.title}
                </h3>
                {task.description ? (
                  <p className="mt-2 text-sm font-semibold leading-6 text-zinc-700">
                    {task.description}
                  </p>
                ) : null}
                {completed && task.completed_at ? (
                  <p className="mt-2 text-xs font-black uppercase">
                    Completed {formatCompletedDate(task.completed_at)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-paper-base p-3 shadow-brutal-sm">
            <p className="text-xs font-black uppercase text-zinc-500">
              Quick status
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["todo", "in_progress", "completed"] as const).map((status) => (
                <Button
                  disabled={
                    saving || deleting || updatingStatus || task.status === status
                  }
                  key={status}
                  onClick={() => onStatusUpdate(task.id, status)}
                  size="sm"
                  type="button"
                  variant={status === "completed" ? "highlight" : "secondary"}
                >
                  {statusPending === status
                    ? "Updating status..."
                    : statusCopy[status]}
                </Button>
              ))}
            </div>
          </div>

          {confirmingDelete ? (
            <div
              className="rounded-lg border-2 border-black bg-accent-pink p-4 shadow-brutal-sm"
              role="alert"
            >
              <p className="font-black">Delete this task?</p>
              <p className="mt-1 text-sm font-semibold leading-6">
                This removes the task from the roadmap checklist.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={deleting}
                  onClick={handleDelete}
                  size="sm"
                  type="button"
                  variant="danger"
                >
                  {deleting ? "Deleting task..." : "Delete task"}
                </Button>
                <Button
                  disabled={deleting}
                  onClick={() => setConfirmingDelete(false)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Keep task
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={saving || deleting || updatingStatus}
                onClick={() => setEditing(true)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Edit
              </Button>
              <Button
                disabled={saving || deleting || updatingStatus}
                onClick={() => setConfirmingDelete(true)}
                size="sm"
                type="button"
                variant="danger"
              >
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </article>
  );
}
