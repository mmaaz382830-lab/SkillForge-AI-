"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DifficultyLevel } from "@/types/app";
import type { InterviewGenerationInput } from "@/types/interviews";
import type { MaterialRoadmapOption } from "@/types/materials";

type InterviewGenerationFormProps = {
  materials: MaterialRoadmapOption[];
  onSubmit: (input: InterviewGenerationInput) => Promise<boolean>;
  pending?: boolean;
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function InterviewGenerationForm({
  materials,
  onSubmit,
  pending = false,
}: InterviewGenerationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const [clientError, setClientError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const formData = new FormData(event.currentTarget);
    const materialId = readFormValue(formData, "material_id").trim();
    const questionCount = Number(readFormValue(formData, "question_count"));

    if (!materialId) {
      setClientError("Select a processed material first.");
      return;
    }

    const saved = await onSubmit({
      material_id: materialId,
      topic: readFormValue(formData, "topic"),
      difficulty: readFormValue(formData, "difficulty") as DifficultyLevel,
      question_count: Number.isFinite(questionCount) ? questionCount : 6,
    });

    if (saved) {
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

      <Select
        disabled={pending}
        helperText={
          materials.length === 0
            ? "Upload or paste material and wait for processing to complete."
            : "Only completed materials with extracted text are listed."
        }
        id={`${formId}-material`}
        label="Processed material"
        name="material_id"
      >
        <option value="">Choose material</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.title}
          </option>
        ))}
      </Select>

      <Input
        disabled={pending}
        helperText="Optional. Focus the questions on one concept from the selected material."
        id={`${formId}-topic`}
        label="Topic focus"
        maxLength={120}
        name="topic"
        placeholder="React hooks, system design, async patterns"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          defaultValue="beginner"
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
          defaultValue="6"
          disabled={pending}
          id={`${formId}-question-count`}
          label="Questions"
          max="12"
          min="5"
          name="question_count"
          type="number"
        />
      </div>

      <Button disabled={pending} type="submit" variant="highlight">
        {pending ? "Forging your interview questions..." : "Generate questions"}
      </Button>
    </form>
  );
}
