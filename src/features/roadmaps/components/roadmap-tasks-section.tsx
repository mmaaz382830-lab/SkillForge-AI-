"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  createRoadmapTask,
  deleteRoadmapTask,
  updateRoadmapTask,
  updateRoadmapTaskStatus,
} from "@/lib/roadmaps/actions";
import type {
  RoadmapTaskInput,
  RoadmapTaskStatus,
  RoadmapTaskView,
} from "@/types/roadmaps";

import { RoadmapTaskCard } from "./roadmap-task-card";
import { RoadmapTaskForm } from "./roadmap-task-form";

type RoadmapTasksSectionProps = {
  roadmapId: string;
  tasks: RoadmapTaskView[];
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
  | `status:${string}:${RoadmapTaskStatus}`
  | null;

export function RoadmapTasksSection({
  roadmapId,
  tasks,
}: RoadmapTasksSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const creating = pendingAction === "create";
  const suggestedOrderIndex = useMemo(() => {
    if (tasks.length === 0) {
      return 1;
    }

    return Math.max(...tasks.map((task) => task.order_index)) + 1;
  }, [tasks]);

  async function handleCreate(input: RoadmapTaskInput): Promise<boolean> {
    setFeedback(null);
    setPendingAction("create");

    const result = await createRoadmapTask(roadmapId, input);

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
      title: "Task saved.",
      description: "The roadmap checklist and progress have been updated.",
    });
    router.refresh();
    return true;
  }

  async function handleUpdate(
    taskId: string,
    input: RoadmapTaskInput,
  ): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`update:${taskId}`);

    const result = await updateRoadmapTask(taskId, input);

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
      title: "Task updated.",
    });
    router.refresh();
    return true;
  }

  async function handleDelete(taskId: string): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`delete:${taskId}`);

    const result = await deleteRoadmapTask(taskId);

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
      title: "Task deleted.",
    });
    router.refresh();
    return true;
  }

  async function handleStatusUpdate(
    taskId: string,
    status: RoadmapTaskStatus,
  ): Promise<boolean> {
    setFeedback(null);
    setPendingAction(`status:${taskId}:${status}`);

    const result = await updateRoadmapTaskStatus(taskId, status);

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
      title: "Task status updated.",
      description:
        status === "completed"
          ? "Completed time was recorded by the server."
          : "Completed time was cleared by the server if needed.",
    });
    router.refresh();
    return true;
  }

  function getStatusPending(taskId: string): RoadmapTaskStatus | null {
    if (!pendingAction?.startsWith(`status:${taskId}:`)) {
      return null;
    }

    return pendingAction.split(":")[2] as RoadmapTaskStatus;
  }

  return (
    <section aria-labelledby="roadmap-tasks-heading" className="grid gap-5">
      <div className="brutal-card p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.52fr)] xl:items-start">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">
              Roadmap checklist
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="roadmap-tasks-heading"
            >
              Tasks
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Keep tasks ordered for the learning path. Status changes update
              completion progress through the server action.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-accent-yellow px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} saved
              </div>
              <div className="rounded-md border-2 border-black bg-accent-green px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {tasks.filter((task) => task.status === "completed").length} completed
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-accent-yellow p-4 shadow-brutal xl:sticky xl:top-6">
            <h3 className="mb-3 font-heading text-xl font-black">
              Add a task
            </h3>
            <RoadmapTaskForm
              onSubmit={handleCreate}
              pending={creating}
              suggestedOrderIndex={suggestedOrderIndex}
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

      {tasks.length === 0 ? (
        <EmptyState
          accent="yellow"
          description="No tasks yet. Add your first roadmap task to start tracking progress."
          title="No tasks yet."
        />
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <RoadmapTaskCard
              deleting={pendingAction === `delete:${task.id}`}
              key={task.id}
              onDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
              onUpdate={handleUpdate}
              saving={pendingAction === `update:${task.id}`}
              statusPending={getStatusPending(task.id)}
              task={task}
            />
          ))}
        </div>
      )}
    </section>
  );
}
