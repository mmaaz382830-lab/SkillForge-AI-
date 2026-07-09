import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function MobileDataList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid min-w-0 gap-3 md:hidden", className)} {...props} />;
}

export function MobileDataCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "grid min-w-0 max-w-full gap-3 rounded-lg border-2 border-black bg-paper-base p-4 shadow-brutal-sm",
        className,
      )}
      {...props}
    />
  );
}

export function MobileDataField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      <dt className="text-[0.6875rem] font-black uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-semibold">{children}</dd>
    </div>
  );
}
