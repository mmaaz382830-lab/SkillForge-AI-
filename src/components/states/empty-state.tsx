import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StateAccent = "yellow" | "green" | "pink" | "blue";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  accent?: StateAccent;
  className?: string;
};

const accentClasses: Record<StateAccent, string> = {
  yellow: "bg-accent-yellow",
  green: "bg-accent-green",
  pink: "bg-accent-pink",
  blue: "bg-accent-blue",
};

export function EmptyState({
  title,
  description,
  action,
  accent = "yellow",
  className,
}: EmptyStateProps) {
  return (
    <section className={cn("brutal-card p-6", className)}>
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-md border-2 border-black text-xl font-black shadow-brutal-sm",
          accentClasses[accent],
        )}
        aria-hidden="true"
      >
        +
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 font-medium leading-7">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
