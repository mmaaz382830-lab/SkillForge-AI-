import * as React from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, children, ...props }, ref) => {
    const helperId = id && helperText ? `${id}-helper` : undefined;
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <label className="grid gap-2 font-bold">
        {label ? <span>{label}</span> : null}
        <select
          aria-describedby={cn(helperId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full min-h-11 rounded-md border-2 border-black bg-paper-base px-3 py-2 text-base font-bold shadow-brutal-sm outline-none",
            error && "border-state-error bg-accent-pink",
            className,
          )}
          id={id}
          ref={ref}
          {...props}
        >
          {children}
        </select>
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

Select.displayName = "Select";
