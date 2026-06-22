import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "neutral"
  | "yellow"
  | "green"
  | "pink"
  | "blue"
  | "success"
  | "warning"
  | "error"
  | "dark";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-paper-muted text-ink-text",
  yellow: "bg-accent-yellow text-ink-text",
  green: "bg-accent-green text-ink-text",
  pink: "bg-accent-pink text-ink-text",
  blue: "bg-accent-blue text-ink-text",
  success: "bg-state-success text-ink-text",
  warning: "bg-state-warning text-ink-text",
  error: "bg-state-error text-paper-base",
  dark: "bg-card-dark text-paper-base",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-pill border-2 border-black px-3 py-1 text-xs font-black uppercase leading-none shadow-brutal-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
