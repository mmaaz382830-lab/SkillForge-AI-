import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "highlight"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-card-dark text-paper-base",
  secondary: "bg-paper-base text-ink-text",
  highlight: "bg-accent-yellow text-ink-text",
  ghost:
    "border-transparent bg-transparent text-ink-text shadow-none hover:bg-accent-yellow",
  danger: "bg-state-error text-paper-base",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2.5 text-base",
  lg: "min-h-12 px-6 py-3 text-lg",
  icon: "h-11 w-11 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const ariaDisabled =
      props["aria-disabled"] === true || props["aria-disabled"] === "true";
    const isDisabled = disabled || loading || ariaDisabled;

    return (
      // Some browser extensions inject attributes like fdprocessedid before hydration.
      <button
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border-2 border-black font-black leading-none transition disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none",
          variant !== "ghost" && "pressable",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={isDisabled}
        ref={ref}
        type={type}
        {...props}
      >
        {loading ? "Working..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";
