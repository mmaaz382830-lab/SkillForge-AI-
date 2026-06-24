"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DifficultyLevel } from "@/types/app";
import type { LearningGoalInput, LearningGoalView } from "@/types/roadmaps";

type LearningGoalFormProps = {
  goal?: LearningGoalView;
  mode?: "create" | "edit";
  pending?: boolean;
  onCancel?: () => void;
  onSubmit: (input: LearningGoalInput) => Promise<boolean>;
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function LearningGoalForm({
  goal,
  mode = "create",
  pending = false,
  onCancel,
  onSubmit,
}: LearningGoalFormProps) {
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
      setClientError("Goal title is required.");
      return;
    }

    const saved = await onSubmit({
      title,
      description: readFormValue(formData, "description"),
      category: readFormValue(formData, "category"),
      difficulty: readFormValue(formData, "difficulty") as DifficultyLevel,
      target_date: readFormValue(formData, "target_date"),
    });

    if (saved && !isEdit) {
      formRef.current?.reset();
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      {clientError ? (
        <p className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black" role="alert">
          {clientError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          defaultValue={goal?.title ?? ""}
          disabled={pending}
          id={`${formId}-title`}
          label="Goal title"
          maxLength={120}
          name="title"
          placeholder="Master React hooks"
          required
        />
        <Input
          defaultValue={goal?.category ?? ""}
          disabled={pending}
          id={`${formId}-category`}
          label="Category"
          maxLength={120}
          name="category"
          placeholder="Frontend, AI, interview prep"
        />
      </div>

      <Textarea
        defaultValue={goal?.description ?? ""}
        disabled={pending}
        id={`${formId}-description`}
        label="Description"
        maxLength={2000}
        name="description"
        placeholder="What should this learning goal help you practice?"
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          defaultValue={goal?.difficulty ?? "beginner"}
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
          defaultValue={goal?.target_date ?? ""}
          disabled={pending}
          id={`${formId}-target-date`}
          label="Target date"
          name="target_date"
          type="date"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} type="submit" variant="highlight">
          {pending ? "Saving goal..." : isEdit ? "Save changes" : "Create goal"}
        </Button>
        {onCancel ? (
          <Button disabled={pending} onClick={onCancel} type="button" variant="secondary">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
