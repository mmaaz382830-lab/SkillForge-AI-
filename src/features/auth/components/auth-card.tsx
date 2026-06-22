import { cn } from "@/lib/utils/cn";

type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * AuthCard — the central brutal card used on all auth pages.
 * Hard black border, 4px hard offset shadow, cream background, rounded corners.
 * Server component — no client logic.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "brutal-card w-full max-w-md p-8 sm:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
