import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ToastVariant = "success" | "error" | "warning" | "info";

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
  title: string;
  description?: string;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-accent-green",
  error: "bg-accent-pink",
  warning: "bg-accent-yellow",
  info: "bg-accent-blue",
};

export function Toast({
  className,
  variant = "info",
  title,
  description,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        "brutal-border brutal-shadow rounded-lg p-4",
        variantClasses[variant],
        className,
      )}
      role="status"
      {...props}
    >
      <p className="font-black">{title}</p>
      {description ? (
        <p className="mt-1 text-sm font-semibold leading-6">{description}</p>
      ) : null}
    </div>
  );
}
