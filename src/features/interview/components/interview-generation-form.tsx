"use client";

import { type FormEvent, useId, useRef, useState, useEffect } from "react";

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
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    materials[0]?.id ?? "",
  );

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMaterialId(materials[0].id);
    }
  }, [materials, selectedMaterialId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    console.log("[Day8 Interview] submit material id", selectedMaterialId);

    if (materials.length === 0) {
      setClientError("Upload and process a material before generating interview questions.");
      return;
    }

    const materialId = selectedMaterialId.trim();
    if (!materialId) {
      setClientError("Select a processed material first.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const questionCount = Number(readFormValue(formData, "question_count"));

    const saved = await onSubmit({
      material_id: materialId,
      topic_focus: readFormValue(formData, "topic_focus"),
      difficulty: readFormValue(formData, "difficulty") as DifficultyLevel,
      question_count: Number.isFinite(questionCount) ? questionCount : 6,
    });

    if (saved) {
      formRef.current?.reset();
      setSelectedMaterialId(materials[0]?.id ?? "");
      setClientError(null);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} ref={formRef}>
      {materials.length === 0 ? (
        <p
          className="rounded-md border-2 border-black bg-paper-muted px-3 py-2 text-sm font-semibold"
          role="note"
        >
          Upload and process a material before generating interview questions.
        </p>
      ) : clientError ? (
        <p
          className="rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black"
          role="alert"
        >
          {clientError}
        </p>
      ) : null}

      <Select
        disabled={pending || materials.length === 0}
        helperText={
          materials.length === 0
            ? "Upload or paste material and wait for processing to complete."
            : "Only completed materials with extracted text are listed."
        }
        id={`${formId}-material`}
        label="Processed material"
        name="material_id"
        onChange={(event) => {
          setSelectedMaterialId(event.target.value);
          if (clientError) setClientError(null);
        }}
        value={selectedMaterialId}
      >
        <option disabled={materials.length > 0} value="">
          {materials.length === 0 ? "No completed materials" : "Choose material"}
        </option>
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
        name="topic_focus"
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

      <Button
        disabled={pending || materials.length === 0}
        type="submit"
        variant="highlight"
      >
        {pending ? "Forging your interview questions..." : "Generate questions"}
      </Button>
    </form>
  );
}

