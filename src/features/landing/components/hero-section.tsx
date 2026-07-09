import Link from "next/link";
import { Badge } from "@/components/ui";
import { Container } from "@/components/layout";
import { publicRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { LandingCardPreview } from "./landing-card-preview";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const primaryCta =
  "pressable inline-flex min-h-11 w-full items-center justify-center rounded-md bg-card-dark px-4 py-3 text-sm font-black leading-none text-paper-base no-underline hover:bg-card-dark sm:min-h-12 sm:w-auto sm:px-6 sm:text-base";

const secondaryCta =
  "pressable inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent-yellow px-4 py-3 text-sm font-black leading-none no-underline hover:bg-accent-yellow sm:min-h-12 sm:w-auto sm:px-6 sm:text-base";

export function HeroSection() {
  return (
    <section className="overflow-x-clip py-10 sm:py-16 lg:py-20">
      <Container className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <ScrollReveal stagger className="grid min-w-0 gap-5 sm:gap-6">
          <div>
            <Badge variant="yellow">Digital study desk</Badge>
          </div>
          <h1 className="text-[clamp(2.625rem,12vw,3.25rem)] sm:text-[clamp(3.25rem,8vw,5rem)]">
            Turn{" "}
            <span className="hover-highlight-pink transition-all duration-200 cursor-default px-1 inline-block">
              messy notes
            </span>{" "}
            into a{" "}
            <span className="inline max-w-full bg-accent-yellow px-1 transition-all duration-200 hover-highlight-green cursor-default sm:inline-block sm:-rotate-1 sm:px-2">
              learning system.
            </span>
          </h1>
          <p className="text-base font-medium leading-7 sm:text-xl sm:leading-8">
            {siteConfig.name} turns PDFs, text notes, and pasted material into
            roadmaps, flashcards, quizzes, mock interviews, and note-grounded
            answers.
          </p>
          <div className="grid gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
            <Link className={primaryCta} href={publicRoutes.signup}>
              Start Free
            </Link>
            <Link className={secondaryCta} href="#how-it-works">
              See How It Works
            </Link>
          </div>
        </ScrollReveal>
        <LandingCardPreview />
      </Container>
    </section>
  );
}
