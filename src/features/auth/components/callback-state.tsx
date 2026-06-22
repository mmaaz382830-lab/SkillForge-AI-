import Link from "next/link";
import { publicRoutes } from "@/config/routes";

/**
 * CallbackState — visual loading/error state for the /auth/callback page.
 * No OAuth code exchange. No search param reading for auth. No Supabase.
 * No redirect. Static visual shell only.
 * Server component — no client logic.
 */
export function CallbackState() {
  return (
    <div className="grid gap-8 text-center">
      {/* Animated loading indicator — CSS only, no JS */}
      <div className="flex justify-center" aria-hidden="true">
        <div
          className="h-14 w-14 rounded-full border-4 border-black border-t-accent-yellow"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>

      {/* Primary status message */}
      <div
        aria-live="polite"
        aria-busy="true"
        role="status"
        className="grid gap-2"
      >
        <p className="font-heading text-2xl font-black text-ink-text">
          Completing sign in&hellip;
        </p>
        <p className="text-base font-medium text-zinc-600">
          Please wait a moment while we set things up.
        </p>
      </div>

      {/* Safe fallback message */}
      <div
        className="brutal-border rounded-md bg-accent-pink px-4 py-3 text-sm font-semibold text-ink-text"
        role="alert"
        aria-live="assertive"
      >
        Could not complete login. Please try again.
      </div>

      {/* Back to login */}
      <Link
        href={publicRoutes.login}
        className="inline-flex items-center justify-center gap-1 font-black underline decoration-2 underline-offset-2"
      >
        ← Return to log in
      </Link>

      {/* Keyframe for the spinner — scoped style tag */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
