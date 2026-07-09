import * as React from "react";
import { Badge, Button } from "@/components/ui";
import { signOutAndRedirect } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

type DashboardTopbarProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  accountLabel?: string;
  className?: string;
};

export function DashboardTopbar({
  title = "Dashboard",
  description,
  actions,
  accountLabel = "Signed out",
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
        <div className="grid min-w-0 max-w-4xl gap-1">
          <p className="text-xs font-black uppercase">Study desk</p>
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {description ? (
            <p className="max-w-3xl break-words text-base font-medium leading-7">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {actions}
          <Badge className="max-w-full whitespace-normal break-words leading-4 normal-case" variant="green">
            {accountLabel}
          </Badge>
          <form action={signOutAndRedirect}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
