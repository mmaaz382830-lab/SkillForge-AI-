import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";
import { publicRoutes } from "@/config/routes";

export function ForgotPasswordFormShell() {
  return (
    <div className="grid gap-6">
      <ForgotPasswordForm />

      {/* Back link */}
      <p className="text-center text-sm font-semibold">
        <Link
          href={publicRoutes.login}
          className="font-black underline decoration-2 underline-offset-2"
        >
          ← Back to log in
        </Link>
      </p>
    </div>
  );
}
