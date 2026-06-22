import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  activePath?: string;
  className?: string;
};

export function DashboardShell({
  children,
  title,
  description,
  actions,
  activePath,
  className,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-paper-base text-ink-text lg:flex">
      <DashboardSidebar activePath={activePath} />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          actions={actions}
          description={description}
          title={title}
        />
        <main className={cn("mx-auto grid max-w-7xl gap-6 p-4 sm:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
