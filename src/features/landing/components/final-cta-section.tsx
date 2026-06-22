import Link from "next/link";
import { Container } from "@/components/layout";
import { publicRoutes } from "@/config/routes";

export function FinalCtaSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="brutal-card bg-card-dark p-6 text-paper-base sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-4">
              <p className="text-sm font-black uppercase">
                Static Day 2 preview
              </p>
              <h2 className="text-paper-base">
                Ready to turn your notes into a study system?
              </h2>
              <p className="text-lg font-medium leading-8">
                Upload your material, generate a roadmap, practice with
                quizzes, and prepare for interviews from one learning desk.
                This shell previews the flow before Day 3+ logic is connected.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                className="pressable inline-flex min-h-12 items-center justify-center rounded-md bg-accent-yellow px-6 py-3 text-base font-black leading-none text-ink-text no-underline hover:bg-accent-yellow"
                href={publicRoutes.signup}
              >
                Start Free
              </Link>
              <Link
                className="pressable inline-flex min-h-12 items-center justify-center rounded-md bg-paper-base px-6 py-3 text-base font-black leading-none text-ink-text no-underline hover:bg-paper-base"
                href="#features"
              >
                View Features
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
