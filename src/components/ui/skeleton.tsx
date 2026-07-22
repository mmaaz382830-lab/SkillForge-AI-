import * as React from "react";
import { cn } from "@/lib/utils/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "max-w-full rounded-md border-2 border-black bg-paper-muted shadow-brutal-sm",
        className,
      )}
      {...props}
    />
  );
}
