import Link from "next/link";
import { Badge } from "@/components/ui";
import { Container } from "@/components/layout";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { LandingCardPreview } from "./landing-card-preview";

const primaryCta =
  "pressable inline-flex min-h-12 items-center justify-center rounded-md bg-card-dark px-6 py-3 text-base font-black leading-none text-paper-base no-underline hover:bg-card-dark";

const secondaryCta =
  "pressable inline-flex min-h-12 items-center justify-center rounded-md bg-accent-yellow px-6 py-3 text-base font-black leading-none no-underline hover:bg-accent-yellow";

export function HeroSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <Badge variant="yellow">Digital study desk</Badge>
          <h1>
            Turn messy notes into a{" "}
            <span className="inline-block -rotate-1 bg-accent-yellow px-2">
              learning system.
            </span>
          </h1>
          <p className="text-lg font-medium leading-8 sm:text-xl">
            {siteConfig.name} turns PDFs, text notes, and pasted material into
            roadmaps, flashcards, quizzes, mock interviews, and note-grounded
            answers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className={primaryCta} href={publicRoutes.signup}>
              Start Free
            </Link>
            <Link className={secondaryCta} href="#how-it-works">
              See How It Works
            </Link>
          </div>
        </div>
        <LandingCardPreview />
      </Container>
    </section>
  );
}
