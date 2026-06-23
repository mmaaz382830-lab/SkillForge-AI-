import Link from "next/link";
import { signInWithGoogle } from "@/lib/auth/actions";
import { AuthDivider } from "./auth-divider";
import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { publicRoutes } from "@/config/routes";

type LoginFormShellProps = {
  authErrorMessage?: string | null;
};

export function LoginFormShell({ authErrorMessage }: LoginFormShellProps) {
  return (
    <div className="grid gap-6">
      <LoginForm authErrorMessage={authErrorMessage} />

      <div className="text-right">
        <Link
          href={publicRoutes.forgotPassword}
          className="text-sm font-black underline decoration-2 underline-offset-2"
        >
          Forgot password?
        </Link>
      </div>

      {/* Divider */}
      <AuthDivider />

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <GoogleButton />
      </form>

      {/* Footer link */}
      <p className="text-center text-sm font-semibold">
        No account yet?{" "}
        <Link
          href={publicRoutes.signup}
          className="font-black underline decoration-2 underline-offset-2"
        >
          Create your workspace
        </Link>
      </p>
    </div>
  );
}
