"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordResetFormAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/types/auth";

import { AuthMessage } from "./auth-message";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-6">
      <AuthMessage
        variant={state.message ? (state.success ? "success" : "error") : "info"}
        id="forgot-password-info"
      >
        {state.message ||
          "If an account exists with that email, reset instructions will be sent."}
      </AuthMessage>

      <Input
        id="forgot-email"
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        aria-describedby="forgot-password-info"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        Send reset instructions
      </Button>
    </form>
  );
}
