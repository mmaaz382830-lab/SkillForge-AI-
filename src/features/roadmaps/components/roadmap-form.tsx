"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DifficultyLevel } from "@/types/app";
import type {
  LearningGoalOption,
  RoadmapInput,
  RoadmapView,
} from "@/types/roadmaps";

type RoadmapFormProps = {
  goals: LearningGoalOption[];
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmit: (input: RoadmapInput) => Promise<boolean>;
  pending?: boolean;
  roadmap?: RoadmapView;
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function RoadmapForm({
  goals,
  mode = "create",
  onCancel,
  onSubmit,
  pending = false,
  roadmap,
}: RoadmapFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const [clientError, setClientError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    const title = readFormValue(formData, "title").trim();

    if (!title) {
      setClientError("Roadmap title is required.");
      return;
    }

    const saved = await onSubmit({
      title,
      description: readFormValue(formData, "description"),
      difficulty: readFormValue(formData, "difficulty") as DifficultyLevel,
      estimated_duration: readFormValue(formData, "estimated_duration"),
      goal_id: readFormValue(formData, "goal_id"),
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
        defaultValue={roadmap?.title ?? ""}
        disabled={pending}
        id={`${formId}-title`}
        label="Roadmap title"
        maxLength={120}
        name="title"
        placeholder="React hooks practice plan"
        required
      />

      <Textarea
        defaultValue={roadmap?.description ?? ""}
        disabled={pending}
        id={`${formId}-description`}
        label="Description"
        maxLength={2000}
        name="description"
        placeholder="What should this roadmap help you work through?"
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          defaultValue={roadmap?.difficulty ?? "beginner"}
          disabled={pending}
          id={`${formId}-difficulty`}
          label="Difficulty"
          name="difficulty"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        <Input
          defaultValue={roadmap?.estimated_duration ?? ""}
          disabled={pending}
          id={`${formId}-duration`}
          label="Estimated duration"
          maxLength={80}
          name="estimated_duration"
          placeholder="2 weeks"
        />
      </div>

      <Select
        defaultValue={roadmap?.goal_id ?? ""}
        disabled={pending}
        helperText={
          goals.length === 0
            ? "You can link a goal later after creating one."
            : "Optional. Roadmap ownership is checked on the server."
        }
        id={`${formId}-goal`}
        label="Learning goal"
        name="goal_id"
      >
        <option value="">No linked goal</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.title}
          </option>
        ))}
      </Select>

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit" variant="highlight">
          {pending
            ? "Saving roadmap..."
            : isEdit
              ? "Save roadmap"
              : "Create roadmap"}
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
