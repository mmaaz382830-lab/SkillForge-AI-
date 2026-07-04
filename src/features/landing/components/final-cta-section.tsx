import Link from "next/link";
import { Container } from "@/components/layout";
import { Badge, ScrollReveal } from "@/components/ui";
import { publicRoutes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const steps = [
  { title: "Upload notes", accent: "bg-accent-blue" },
  { title: "Generate roadmap", accent: "bg-accent-yellow" },
  { title: "Practice quiz", accent: "bg-accent-pink" },
  { title: "Track progress", accent: "bg-accent-green" },
] as const;

export function FinalCtaSection() {
  return (
    <section className="py-12 sm:py-16" id="start">
      <Container>
        <ScrollReveal>
          <div className="brutal-border brutal-shadow grid gap-8 rounded-xl bg-card-dark p-6 text-paper-base sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
            <div className="grid gap-6">
              <Badge variant="yellow">Start your study desk</Badge>
              <div className="grid max-w-2xl gap-4">
                <h2 className="font-heading text-3xl font-black leading-none text-paper-base sm:text-5xl">
                  Ready to turn notes into a learning system?
                </h2>
                <p className="text-base font-semibold leading-8 text-paper-base sm:text-lg">
                  Upload material, generate study assets, practice with quizzes
                  and interviews, and track progress from one focused workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  className="pressable inline-flex min-h-12 items-center justify-center rounded-md bg-accent-yellow px-6 py-3 text-base font-black leading-none text-ink-text no-underline hover:bg-accent-yellow"
                  href={publicRoutes.signup}
                >
                  Start Free
                </Link>
                <Link
                  className="pressable inline-flex min-h-12 items-center justify-center rounded-md bg-paper-base px-6 py-3 text-base font-black leading-none text-ink-text no-underline hover:bg-paper-base"
                  href={publicRoutes.features}
                >
                  View Features
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  className={cn(
                    "split-card-right flex items-center gap-3 rounded-lg border-2 border-black bg-paper-base p-4 text-ink-text shadow-brutal-sm",
                    index % 2 === 0 ? "lg:mr-8" : "lg:ml-8",
                  )}
                  key={step.title}
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-md border-2 border-black font-black",
                      step.accent,
                    )}
                  >
                    {index + 1}
                  </span>
                  <p className="font-black leading-6">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
