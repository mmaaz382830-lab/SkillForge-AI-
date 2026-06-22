/**
 * AuthDivider — "or continue with" horizontal rule divider.
 * Purely decorative separator between email/password form and Google button.
 * Server component — no client logic.
 */
export function AuthDivider() {
  return (
    <div className="relative my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-black" aria-hidden="true" />
      <span className="shrink-0 text-sm font-black uppercase tracking-wider text-ink-text">
        or continue with
      </span>
      <div className="h-px flex-1 bg-black" aria-hidden="true" />
    </div>
  );
}
