import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { getCurrentUser } from "@/lib/auth/session";
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

function getUserDisplayLabel(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) {
    return "Signed out";
  }

  const name = user.user_metadata.full_name ?? user.user_metadata.name;

  if (typeof name === "string" && name.trim()) {
    return name;
  }

  return user.email ?? "Signed in";
}

export async function DashboardShell({
  children,
  title,
  description,
  actions,
  activePath,
  className,
}: DashboardShellProps) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-paper-base text-ink-text lg:flex">
      <DashboardSidebar activePath={activePath} />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          actions={actions}
          description={description}
          accountLabel={getUserDisplayLabel(user)}
          title={title}
        />
        <main className={cn("mx-auto grid w-full min-w-0 max-w-7xl gap-6 p-4 sm:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
