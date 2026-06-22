import { Badge } from "@/components/ui/badge";

type QuizOption = { id: string; text: string };

type QuizPreviewCardProps = {
  question: string;
  options: QuizOption[];
  questionNumber: number;
  totalQuestions: number;
  topic: string;
};

/**
 * QuizPreviewCard — visual-only quiz question panel.
 * Shows question, option cards in default state. No selection logic.
 */
export function QuizPreviewCard({
  question,
  options,
  questionNumber,
  totalQuestions,
  topic,
}: QuizPreviewCardProps) {
  return (
    <article className="brutal-card p-5 sm:p-6" aria-label="Quiz question preview">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Badge variant="pink">{topic}</Badge>
          <Badge variant="neutral">
            Q {questionNumber} of {totalQuestions}
          </Badge>
        </div>
        <span className="text-sm font-black text-zinc-500">
          {Math.round((questionNumber / totalQuestions) * 100)}% through
        </span>
      </div>
      <h3 className="mb-5 font-heading text-xl font-black leading-snug">
        {question}
      </h3>
      <div className="grid gap-3" role="list" aria-label="Answer options">
        {options.map((opt, i) => (
          <div
            key={opt.id}
            role="listitem"
            className="liftable cursor-not-allowed rounded-md border-2 border-black bg-paper-base px-4 py-3 font-semibold shadow-brutal-sm"
            aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt.text}`}
          >
            <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-black bg-paper-muted text-xs font-black">
              {String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-card-dark px-4 py-2.5 font-black text-paper-base shadow-brutal-sm disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
        >
          Submit answer
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-paper-muted px-4 py-2.5 font-black shadow-brutal-sm disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
        >
          Skip
        </button>
      </div>
    </article>
  );
}
