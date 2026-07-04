"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateDifficultyPreferencesFormAction } from "@/lib/auth/actions";
import type { DifficultyLevel } from "@/types/app";
import type { AuthActionResult } from "@/types/auth";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

type DifficultyPreferencesFormProps = {
  defaultQuizDifficulty: DifficultyLevel;
  defaultRoadmapDifficulty: DifficultyLevel;
};

export function DifficultyPreferencesForm({
  defaultQuizDifficulty,
  defaultRoadmapDifficulty,
}: DifficultyPreferencesFormProps) {
  const [state, formAction, pending] = useActionState(
    updateDifficultyPreferencesFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          defaultValue={defaultQuizDifficulty}
          disabled={pending}
          helperText="Used when you open the quiz generator."
          id="default-quiz-difficulty"
          label="Default quiz difficulty"
          name="defaultQuizDifficulty"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        <Select
          defaultValue={defaultRoadmapDifficulty}
          disabled={pending}
          helperText="Used when you open the AI roadmap generator."
          id="default-roadmap-difficulty"
          label="Default roadmap difficulty"
          name="defaultRoadmapDifficulty"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button loading={pending} type="submit" variant="highlight">
          Save preferences
        </Button>
        {state.message ? (
          <p
            className={`rounded-md border-2 border-black px-3 py-2 text-sm font-black shadow-brutal-sm ${
              state.success ? "bg-accent-green" : "bg-accent-pink"
            }`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}