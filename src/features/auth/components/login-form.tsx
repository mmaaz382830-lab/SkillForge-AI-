"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmailPasswordFormAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/types/auth";

import { AuthMessage } from "./auth-message";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

type LoginFormProps = {
  authErrorMessage?: string | null;
};

export function LoginForm({ authErrorMessage }: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    signInWithEmailPasswordFormAction,
    initialState,
  );
  const message = state.message || authErrorMessage;

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [router, state.redirectTo, state.success]);

  return (
    <form action={formAction} className="grid gap-4">
      {message ? (
        <AuthMessage variant={state.success ? "success" : "error"}>
          {message}
        </AuthMessage>
      ) : null}

      <Input
        id="login-email"
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <div className="grid gap-2">
        <Input
          id="login-password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        Log in
      </Button>
    </form>
  );
}
