"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  deleteFlashcardDeck,
  generateFlashcardDeck,
} from "@/lib/flashcards/actions";
import type {
  FlashcardDeckView,
  FlashcardGenerationInput,
} from "@/types/flashcards";
import type { MaterialRoadmapOption } from "@/types/materials";

import { FlashcardGenerationForm } from "./flashcard-generation-form";

type FlashcardsSectionProps = {
  decks: FlashcardDeckView[];
  materials: MaterialRoadmapOption[];
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

type StudyCard = FlashcardDeckView["cards"][number];

const difficultyVariants: Record<string, BadgeVariant> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "pink",
};

function formatDifficulty(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getSortedCards(cards: StudyCard[]): StudyCard[] {
  return cards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((first, second) => {
      if (first.card.order_index === second.card.order_index) {
        return first.originalIndex - second.originalIndex;
      }

      return first.card.order_index - second.card.order_index;
    })
    .map(({ card }) => card);
}

function getDeckStudyKey(deck: FlashcardDeckView): string {
  const cardSignature = getSortedCards(deck.cards)
    .map((card) => `${card.id}:${card.order_index}`)
    .join("|");

  return `${deck.id}:${cardSignature}`;
}

function FlashcardStudyDeck({
  deck,
  deleting,
  onDelete,
}: {
  deck: FlashcardDeckView;
  deleting: boolean;
  onDelete: (deckId: string, deckTitle: string) => Promise<void>;
}) {
  const cards = useMemo(() => getSortedCards(deck.cards), [deck.cards]);
  const [cardIndex, setCardIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [passedCardIds, setPassedCardIds] = useState<string[]>([]);
  const [skippedCardIds, setSkippedCardIds] = useState<string[]>([]);
  const handlingCardRef = useRef(false);
  const currentCard: StudyCard | undefined = cards[cardIndex];
  const totalCards = cards.length;
  const handledCardIds = useMemo(
    () => new Set([...passedCardIds, ...skippedCardIds]),
    [passedCardIds, skippedCardIds],
  );
  const completedCount = handledCardIds.size;
  const roundComplete = totalCards > 0 && completedCount === totalCards;


  useEffect(() => {
    handlingCardRef.current = false;
  }, [cardIndex, passedCardIds, skippedCardIds]);

  function handleCardResult(result: "passed" | "skipped") {
    if (!currentCard || handlingCardRef.current) {
      return;
    }

    handlingCardRef.current = true;
    const currentCardId = currentCard.id;

    if (handledCardIds.has(currentCardId)) {
      handlingCardRef.current = false;
      return;
    }

    if (result === "passed") {
      setPassedCardIds((currentIds) => [...currentIds, currentCardId]);
    } else {
      setSkippedCardIds((currentIds) => [...currentIds, currentCardId]);
    }

    const nextHandledCount = completedCount + 1;

    setAnswerVisible(false);

    if (nextHandledCount < totalCards) {
      setCardIndex((currentIndex) => Math.min(currentIndex + 1, totalCards - 1));
    }
  }

  function restartDeck() {
    setCardIndex(0);
    setAnswerVisible(false);
    setPassedCardIds([]);
    setSkippedCardIds([]);
    handlingCardRef.current = false;
  }

  return (
    <article className="brutal-card grid gap-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="green">{deck.topic ?? "Flashcards"}</Badge>
            <Badge variant="neutral">{totalCards} cards</Badge>
          </div>
          <h3 className="mt-3 font-heading text-2xl font-black leading-tight">
            {deck.title}
          </h3>
        </div>
        <Button
          disabled={deleting}
          onClick={() => onDelete(deck.id, deck.title)}
          size="sm"
          type="button"
          variant="danger"
        >
          {deleting ? "Deleting..." : "Delete deck"}
        </Button>
      </div>

      {totalCards === 0 || !currentCard ? (
        <div className="rounded-lg border-2 border-black bg-paper-muted p-4 text-sm font-black shadow-brutal-sm">
          This deck has no cards saved.
        </div>
      ) : roundComplete ? (
        <div className="rounded-xl border-2 border-black bg-accent-green p-5 shadow-brutal">
          <p className="text-xs font-black uppercase text-zinc-700">
            Round complete
          </p>
          <h4 className="mt-2 font-heading text-2xl font-black leading-tight">
            You handled every card in this deck.
          </h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border-2 border-black bg-paper-base px-3 py-2 shadow-brutal-sm">
              <p className="text-xs font-black uppercase text-zinc-500">Total</p>
              <p className="mt-1 font-heading text-xl font-black">{totalCards}</p>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-base px-3 py-2 shadow-brutal-sm">
              <p className="text-xs font-black uppercase text-zinc-500">Completed</p>
              <p className="mt-1 font-heading text-xl font-black">
                {completedCount} / {totalCards}
              </p>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-base px-3 py-2 shadow-brutal-sm">
              <p className="text-xs font-black uppercase text-zinc-500">Passed</p>
              <p className="mt-1 font-heading text-xl font-black">
                {passedCardIds.length}
              </p>
            </div>
            <div className="rounded-md border-2 border-black bg-paper-base px-3 py-2 shadow-brutal-sm">
              <p className="text-xs font-black uppercase text-zinc-500">Skipped</p>
              <p className="mt-1 font-heading text-xl font-black">
                {skippedCardIds.length}
              </p>
            </div>
          </div>
          <Button
            className="mt-5"
            onClick={restartDeck}
            type="button"
            variant="highlight"
          >
            Study again
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-black bg-paper-base p-4 shadow-brutal sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                {currentCard.topic ?? deck.topic ?? "Card"}
              </Badge>
              <Badge
                variant={difficultyVariants[currentCard.difficulty] ?? "neutral"}
              >
                {formatDifficulty(currentCard.difficulty)}
              </Badge>
            </div>
            <span className="rounded border-2 border-black bg-accent-green px-2 py-1 text-xs font-black shadow-brutal-sm">
              {cardIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="min-h-44 rounded-lg border-2 border-black bg-accent-green p-5 shadow-brutal-sm">
            <p className="text-xs font-black uppercase text-zinc-600">Question</p>
            <p className="mt-3 font-heading text-xl font-black leading-snug">
              {currentCard.front}
            </p>
          </div>

          {answerVisible ? (
            <div className="mt-4 rounded-lg border-2 border-black bg-paper-muted p-5 shadow-brutal-sm">
              <p className="text-xs font-black uppercase text-zinc-600">Answer</p>
              <p className="mt-3 text-base font-semibold leading-7">
                {currentCard.back}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border-2 border-dashed border-black bg-paper-muted p-5 text-sm font-black shadow-brutal-sm">
              Answer hidden. Reveal it when you are ready to check yourself.
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-black text-zinc-600">
              Progress: {completedCount} / {totalCards}
            </span>
            <div className="flex flex-wrap gap-3">
              {!answerVisible ? (
                <Button
                  onClick={() => setAnswerVisible(true)}
                  type="button"
                  variant="highlight"
                >
                  Reveal answer
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleCardResult("skipped")}
                    type="button"
                    variant="secondary"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={() => handleCardResult("passed")}
                    type="button"
                    variant="highlight"
                  >
                    Pass
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function FlashcardsSection({ decks, materials }: FlashcardsSectionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  async function handleGenerate(
    input: FlashcardGenerationInput,
  ): Promise<boolean> {
    setFeedback(null);
    setGenerating(true);

    const result = await generateFlashcardDeck(input);

    setGenerating(false);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return false;
    }

    setFeedback({
      variant: "success",
      title: "Flashcard deck generated and saved.",
      description: "Study the new deck one card at a time below.",
    });
    router.refresh();
    return true;
  }

  async function handleDelete(deckId: string, deckTitle: string) {
    setFeedback(null);
    setDeletingDeckId(deckId);

    const result = await deleteFlashcardDeck(deckId);

    setDeletingDeckId(null);

    if (!result.ok) {
      setFeedback({
        variant: "error",
        title: result.error,
      });
      return;
    }

    setFeedback({
      variant: "success",
      title: "Flashcard deck deleted.",
      description: `${deckTitle} was removed from your study list.`,
    });
    router.refresh();
  }

  return (
    <section aria-labelledby="flashcards-heading" className="grid gap-5">
      <div className="brutal-card p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)] xl:items-start">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">
              Day 6 generator
            </p>
            <h2
              className="mt-1 font-heading text-3xl font-black leading-tight"
              id="flashcards-heading"
            >
              Flashcard decks
            </h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7">
              Turn processed material into compact front/back cards for quick
              revision. Decks stay tied to your own uploaded material.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border-2 border-black bg-accent-green px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {decks.length} {decks.length === 1 ? "deck" : "decks"} saved
              </div>
              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {materials.length === 0
                  ? "No processed materials"
                  : `${materials.length} materials ready`}
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-black bg-accent-green p-4 shadow-brutal">
            <h3 className="font-heading text-xl font-black">
              Generate with AI
            </h3>
            <p className="mb-3 mt-1 text-sm font-semibold leading-6">
              Usage is checked before the AI call. Only saved decks count as
              successful usage.
            </p>
            <FlashcardGenerationForm
              materials={materials}
              onSubmit={handleGenerate}
              pending={generating}
            />
          </div>
        </div>
      </div>

      {feedback ? (
        <Toast
          description={feedback.description}
          title={feedback.title}
          variant={feedback.variant}
        />
      ) : null}

      {decks.length === 0 ? (
        <EmptyState
          accent="green"
          description={
            materials.length === 0
              ? "Upload and process a material first to generate flashcards."
              : "Generate a deck from a completed material. Study mode shows one question at a time and hides the answer until you reveal it."
          }
          title="No flashcards yet."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {decks.map((deck) => (
            <FlashcardStudyDeck
              deck={deck}
              deleting={deletingDeckId === deck.id}
              key={getDeckStudyKey(deck)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}


