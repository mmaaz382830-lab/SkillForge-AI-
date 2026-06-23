"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmailPasswordFormAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/types/auth";

import { AuthMessage } from "./auth-message";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signUpWithEmailPasswordFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <AuthMessage variant={state.success ? "success" : "error"}>
          {state.message}
        </AuthMessage>
      ) : null}

      <Input
        id="signup-name"
        label="Full name (optional)"
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="Your name"
        maxLength={80}
      />
      <Input
        id="signup-email"
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <Input
        id="signup-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        helperText="Use 8+ characters with a mix of letters and numbers."
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        Create account
      </Button>
    </form>
  );
}
