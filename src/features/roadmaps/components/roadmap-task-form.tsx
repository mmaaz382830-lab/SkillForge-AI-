"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  RoadmapTaskInput,
  RoadmapTaskStatus,
  RoadmapTaskView,
} from "@/types/roadmaps";

type RoadmapTaskFormProps = {
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (input: RoadmapTaskInput) => Promise<boolean>;
  pending?: boolean;
  suggestedOrderIndex?: number;
  task?: RoadmapTaskView;
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function RoadmapTaskForm({
  mode = "create",
  onCancel,
  onSubmit,
  pending = false,
  suggestedOrderIndex = 0,
  task,
}: RoadmapTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const [clientError, setClientError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    const title = readFormValue(formData, "title").trim();
    const orderValue = Number(readFormValue(formData, "order_index"));

    if (!title) {
      setClientError("Task title is required.");
      return;
    }

    if (!Number.isInteger(orderValue) || orderValue < 0) {
      setClientError("Task order must be a valid number.");
      return;
    }

    const saved = await onSubmit({
      title,
      description: readFormValue(formData, "description"),
      estimated_time: readFormValue(formData, "estimated_time"),
      order_index: orderValue,
      status: readFormValue(formData, "status") as RoadmapTaskStatus,
    });

    if (saved && !isEdit) {
      formRef.current?.reset();
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      {clientError ? (
        <p
          className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black"
          role="alert"
        >
          {clientError}
        </p>
      ) : null}

      <Input
        defaultValue={task?.title ?? ""}
        disabled={pending}
        id={`${formId}-title`}
        label="Task title"
        maxLength={120}
        name="title"
        placeholder="Read the hooks chapter"
        required
      />

      <Textarea
        defaultValue={task?.description ?? ""}
        disabled={pending}
        id={`${formId}-description`}
        label="Description"
        maxLength={2000}
        name="description"
        placeholder="What should be done before this task is complete?"
        rows={3}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          defaultValue={task?.estimated_time ?? ""}
          disabled={pending}
          id={`${formId}-estimated-time`}
          label="Estimated time"
          maxLength={80}
          name="estimated_time"
          placeholder="30 minutes"
        />
        <Input
          defaultValue={task?.order_index ?? suggestedOrderIndex}
          disabled={pending}
          id={`${formId}-order`}
          label="Order"
          min={0}
          name="order_index"
          step={1}
          type="number"
        />
        <Select
          defaultValue={task?.status ?? "todo"}
          disabled={pending}
          id={`${formId}-status`}
          label="Status"
          name="status"
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit" variant="highlight">
          {pending ? "Saving task..." : isEdit ? "Save task" : "Add task"}
        </Button>
        {onCancel ? (
          <Button
            disabled={pending}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
