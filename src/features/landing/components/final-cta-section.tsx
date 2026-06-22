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
              <p className="text-sm font-black uppercase">Ready when auth arrives</p>
              <h2 className="text-paper-base">
                Build your learning system from your own notes.
              </h2>
              <p className="text-lg font-medium leading-8">
                Start with the public shell today. The protected learning
                workspace, uploads, AI, and RAG logic come in later phases.
              </p>
            </div>
            <Link
              className="pressable inline-flex min-h-12 items-center justify-center rounded-md bg-accent-yellow px-6 py-3 text-base font-black leading-none text-ink-text no-underline hover:bg-accent-yellow"
              href={publicRoutes.signup}
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
