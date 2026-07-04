"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDisplayNameFormAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/types/auth";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

type ProfileDisplayNameFormProps = {
  displayName: string;
};

export function ProfileDisplayNameForm({
  displayName,
}: ProfileDisplayNameFormProps) {
  const [state, formAction, pending] = useActionState(
    updateDisplayNameFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Input
        autoComplete="name"
        defaultValue={displayName}
        disabled={pending}
        helperText="Updates your display name only. Role and plan are managed separately."
        id="profile-display-name"
        label="Display name"
        maxLength={80}
        name="fullName"
        placeholder="Your name"
        required
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button loading={pending} type="submit" variant="highlight">
          Save display name
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