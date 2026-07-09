import * as React from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { Container } from "./container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
    <section className={cn("overflow-x-clip py-12 sm:py-16", variantClasses[variant], className)} {...props}>
      <ScrollReveal>
        <Container className="grid min-w-0 gap-6 sm:gap-8">
          {eyebrow || title || description ? (
            <div className="grid min-w-0 max-w-3xl gap-3 sm:gap-4">
              {eyebrow ? <Badge variant="yellow">{eyebrow}</Badge> : null}
              {title ? (
                <h2 className="hover-highlight-yellow inline-block max-w-full cursor-default transition-all duration-200">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-base font-medium leading-7 sm:text-lg sm:leading-8">{description}</p>
              ) : null}
            </div>
          ) : null}
          {children}
        </Container>
      </ScrollReveal>
    </section>
  );
}
