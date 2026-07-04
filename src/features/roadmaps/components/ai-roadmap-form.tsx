"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DifficultyLevel } from "@/types/app";
import type { MaterialRoadmapOption } from "@/types/materials";
import type {
  AiRoadmapGenerationInput,
  LearningGoalOption,
} from "@/types/roadmaps";

type AiRoadmapFormProps = {
  goals: LearningGoalOption[];
  materials: MaterialRoadmapOption[];
  onSubmit: (input: AiRoadmapGenerationInput) => Promise<boolean>;
  pending?: boolean;
  defaultDifficulty?: DifficultyLevel;
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function AiRoadmapForm({
  goals,
  materials,
  onSubmit,
  pending = false,
  defaultDifficulty = "beginner",
}: AiRoadmapFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const [clientError, setClientError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    const materialId = readFormValue(formData, "material_id").trim();
    const goalId = readFormValue(formData, "goal_id").trim();
    const topic = readFormValue(formData, "topic").trim();
    const taskCount = Number(readFormValue(formData, "task_count"));

    if (!materialId && !goalId && !topic) {
      setClientError("Choose a material, goal, or topic first.");
      return;
    }

    const saved = await onSubmit({
      material_id: materialId,
      goal_id: goalId,
      topic,
      difficulty: readFormValue(formData, "difficulty") as DifficultyLevel,
      estimated_duration: readFormValue(formData, "estimated_duration"),
      task_count: Number.isFinite(taskCount) ? taskCount : 7,
    });

    if (saved) {
      formRef.current?.reset();
    }
  }

  return (
    <form className="grid min-w-0 gap-4" onSubmit={handleSubmit} ref={formRef}>
      {clientError ? (
        <p
          className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black"
          role="alert"
        >
          {clientError}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <Select
          disabled={pending}
          helperText={
            materials.length === 0
              ? "Processed materials will appear here. Manual topic still works."
              : "Only completed materials are listed."
          }
          id={`${formId}-material`}
          label="Processed material"
          name="material_id"
        >
          <option value="">No material</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.title}
            </option>
          ))}
        </Select>

        <Select
          disabled={pending}
          helperText={
            goals.length === 0
              ? "Create a goal above or use a manual topic."
              : "Optional. Ownership is checked on the server."
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
      </div>

      <Textarea
        disabled={pending}
        helperText="Use this when you want a roadmap without a material or to narrow the selected source."
        id={`${formId}-topic`}
        label="Manual topic or goal"
        maxLength={240}
        name="topic"
        placeholder="Build a beginner React interview prep plan from my notes"
        rows={3}
      />

      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <Select
          defaultValue={defaultDifficulty}
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
          defaultValue="7"
          disabled={pending}
          id={`${formId}-task-count`}
          label="Tasks"
          max="10"
          min="5"
          name="task_count"
          type="number"
        />

        <Input
          disabled={pending}
          id={`${formId}-duration`}
          label="Target duration"
          maxLength={80}
          name="estimated_duration"
          placeholder="2 weeks"
        />
      </div>

      <Button disabled={pending} type="submit" variant="highlight">
        {pending ? "Forging your roadmap..." : "Generate roadmap"}
      </Button>
    </form>
  );
}