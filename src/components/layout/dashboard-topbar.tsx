import * as React from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type DashboardTopbarProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function DashboardTopbar({
  title = "Dashboard",
  description,
  actions,
  className,
}: DashboardTopbarProps) {
  return (
    <header
      className={cn(
        "border-b-2 border-black bg-paper-base px-4 py-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <p className="text-xs font-black uppercase">Study desk</p>
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {description ? (
            <p className="text-base font-medium leading-7">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <Badge variant="green">Demo Learner</Badge>
        </div>
      </div>
    </header>
  );
}
