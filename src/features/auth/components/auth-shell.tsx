import { cn } from "@/lib/utils/cn";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * AuthShell — full-page wrapper for all auth pages.
 * Provides the warm paper background with grid texture and centers the auth card.
 * Server component — no client logic.
 */
export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center px-4 py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
