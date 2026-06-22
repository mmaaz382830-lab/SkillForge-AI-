import * as React from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const helperId = id && helperText ? `${id}-helper` : undefined;
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <label className="grid gap-2 font-bold">
        {label ? <span>{label}</span> : null}
        <input
          aria-describedby={cn(helperId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-medium shadow-brutal-sm outline-none placeholder:text-zinc-500",
            error && "border-state-error bg-accent-pink",
            className,
          )}
          id={id}
          ref={ref}
          {...props}
        />
        {helperText ? (
          <span className="text-sm font-semibold" id={helperId}>
            {helperText}
          </span>
        ) : null}
        {error ? (
          <span className="text-sm font-black text-state-error" id={errorId}>
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
