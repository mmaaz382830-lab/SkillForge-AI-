import * as React from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { Container } from "./container";

type SectionVariant = "default" | "muted" | "yellow" | "green" | "pink" | "blue";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  variant?: SectionVariant;
};

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-transparent",
  muted: "bg-paper-muted",
  yellow: "bg-accent-yellow",
  green: "bg-accent-green",
  pink: "bg-accent-pink",
  blue: "bg-accent-blue",
};

export function Section({
  children,
  className,
  eyebrow,
  title,
  description,
  variant = "default",
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 sm:py-16", variantClasses[variant], className)} {...props}>
      <Container className="grid gap-8">
        {eyebrow || title || description ? (
          <div className="grid max-w-3xl gap-4">
            {eyebrow ? <Badge variant="yellow">{eyebrow}</Badge> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? (
              <p className="text-lg font-medium leading-8">{description}</p>
            ) : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
