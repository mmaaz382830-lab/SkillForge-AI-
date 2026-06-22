import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  className,
  size = "xl",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    />
  );
}
