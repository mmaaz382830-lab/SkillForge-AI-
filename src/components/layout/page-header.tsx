import * as React from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="grid max-w-3xl gap-4">
        {eyebrow ? <Badge variant="yellow">{eyebrow}</Badge> : null}
        <div className="grid gap-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
          {description ? (
            <p className="text-lg font-medium leading-8 sm:text-xl">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
