import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "rounded-lg border-2 border-black bg-accent-pink p-6 shadow-brutal",
        className,
      )}
      role="alert"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border-2 border-black bg-paper-base text-xl font-black shadow-brutal-sm"
        aria-hidden="true"
      >
        !
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 font-medium leading-7">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
