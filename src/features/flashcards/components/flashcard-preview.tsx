import { Badge } from "@/components/ui/badge";

type FlashcardPreviewProps = {
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  front: string;
  cardIndex: number;
  totalCards: number;
};

const difficultyVariant: Record<string, "green" | "yellow" | "pink"> = {
  Easy: "green",
  Medium: "yellow",
  Hard: "pink",
};

/**
 * FlashcardPreview — physical study card visual preview.
 * Shows front text with topic/difficulty badges.
 * Show-answer button is visual only — no flip state logic.
 */
export function FlashcardPreview({
  topic,
  difficulty,
  front,
  cardIndex,
  totalCards,
}: FlashcardPreviewProps) {
  return (
    <article
      className="brutal-card flex min-h-56 flex-col justify-between bg-paper-base p-6 sm:p-8"
      aria-label={`Flashcard ${cardIndex} of ${totalCards}: ${topic}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{topic}</Badge>
          <Badge variant={difficultyVariant[difficulty] ?? "neutral"}>
            {difficulty}
          </Badge>
        </div>
        <span className="text-sm font-black text-zinc-500">
          {cardIndex} / {totalCards}
        </span>
      </div>

      <div className="my-6 text-center">
        <p className="font-heading text-xl font-black leading-snug sm:text-2xl">
          {front}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable min-w-36 flex-1 rounded-md border-2 border-black bg-accent-green px-4 py-2.5 font-black shadow-brutal-sm"
        >
          Show answer
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-paper-muted px-4 py-2.5 font-black shadow-brutal-sm"
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-paper-muted px-4 py-2.5 font-black shadow-brutal-sm"
        >
          Next →
        </button>
      </div>
    </article>
  );
}
