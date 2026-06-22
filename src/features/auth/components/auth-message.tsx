import { cn } from "@/lib/utils/cn";

type AuthMessageVariant = "info" | "error" | "success";

type AuthMessageProps = {
  variant?: AuthMessageVariant;
  children: React.ReactNode;
  id?: string;
};

const variantStyles: Record<AuthMessageVariant, string> = {
  info: "border-black bg-accent-blue text-ink-text",
  error: "border-state-error bg-accent-pink text-ink-text",
  success: "border-black bg-accent-green text-ink-text",
};

/**
 * AuthMessage — inline status/info/error banner for auth pages.
 * Uses aria-live="polite" so screen readers are notified of changes.
 * Server component — no client logic.
 */
export function AuthMessage({
  variant = "info",
  children,
  id,
}: AuthMessageProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "brutal-border rounded-md px-4 py-3 text-sm font-semibold",
        variantStyles[variant],
      )}
      id={id}
      role="status"
    >
      {children}
    </div>
  );
}
