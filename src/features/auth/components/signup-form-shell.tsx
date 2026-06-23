import Link from "next/link";
import { signInWithGoogle } from "@/lib/auth/actions";
import { AuthDivider } from "./auth-divider";
import { GoogleButton } from "./google-button";
import { SignupForm } from "./signup-form";
import { publicRoutes } from "@/config/routes";

export function SignupFormShell() {
  return (
    <div className="grid gap-6">
      <SignupForm />

      {/* Helper copy */}
      <p className="rounded-md border-2 border-black bg-accent-yellow px-4 py-3 text-sm font-semibold">
        📚 Upload your notes, PDFs, or text — and build your personal learning
        roadmap from day one.
      </p>

      {/* Divider */}
      <AuthDivider />

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <GoogleButton />
      </form>

      {/* Footer link */}
      <p className="text-center text-sm font-semibold">
        Already have an account?{" "}
        <Link
          href={publicRoutes.login}
          className="font-black underline decoration-2 underline-offset-2"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
