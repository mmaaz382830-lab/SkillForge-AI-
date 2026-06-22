import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { FlashcardPreview } from "@/features/flashcards/components/flashcard-preview";

export const metadata: Metadata = {
  title: `Flashcards — ${siteConfig.name}`,
  description: "Study with AI-generated flashcard decks from your uploaded materials.",
};

const STATIC_DECKS = [
  {
    title: "JavaScript Fundamentals",
    cardCount: 20,
    topic: "JavaScript",
    difficulty: "Beginner" as const,
  },
  {
    title: "React Hooks Deep Dive",
    cardCount: 15,
    topic: "React",
    difficulty: "Intermediate" as const,
  },
  {
    title: "Node.js Core Concepts",
    cardCount: 10,
    topic: "Node.js",
    difficulty: "Intermediate" as const,
  },
];

const diffVariant: Record<string, "green" | "yellow" | "pink"> = {
  Beginner: "green",
  Intermediate: "yellow",
  Advanced: "pink",
};

/**
 * /dashboard/flashcards — Flashcards visual shell.
 * Static data only. No flip state, no real deck logic.
 */
export default function FlashcardsPage() {
  return (
    <DashboardShell
      title="Flashcards"
      description="Revise your material with physical study cards generated from your notes."
      activePath={dashboardRoutes.flashcards}
      actions={
        <Button type="button" variant="primary" size="sm" aria-disabled="true">
          Generate deck
        </Button>
      }
    >
      {/* Deck list */}
      <section aria-label="Your flashcard decks">
        <h2 className="mb-4 font-heading text-xl font-black">Your decks</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIC_DECKS.map((deck) => (
            <article key={deck.title} className="brutal-card p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="neutral">{deck.topic}</Badge>
                <Badge variant={diffVariant[deck.difficulty] ?? "neutral"}>
                  {deck.difficulty}
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-black leading-tight">
                {deck.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                {deck.cardCount} cards
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  aria-disabled="true"
                >
                  Study deck
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Physical flashcard preview */}
      <section aria-label="Flashcard study preview">
        <h2 className="mb-4 font-heading text-xl font-black">
          Study mode — designed preview
        </h2>
        <div className="mx-auto max-w-2xl">
          <FlashcardPreview
            topic="JavaScript"
            difficulty="Medium"
            front="What is the difference between Promise.all and Promise.race?"
            cardIndex={3}
            totalCards={20}
          />
        </div>
      </section>

      {/* Empty state */}
      <EmptyState
        title="No flashcards yet."
        description="Generate a deck from your uploaded material. Each deck becomes a set of physical study cards for revision."
        accent="green"
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Generate first deck
          </Button>
        }
      />
    </DashboardShell>
  );
}
