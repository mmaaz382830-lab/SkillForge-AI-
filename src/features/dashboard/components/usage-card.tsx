import { Progress } from "@/components/ui/progress";

/**
 * UsageCard — visual-only usage quota card.
 * Shows placeholder limits only. No real quota data.
 * "Usage remaining is a visual placeholder for Day 2."
 */
export function UsageCard() {
  return (
    <section
      className="brutal-card p-5 sm:p-6"
      aria-label="Usage remaining"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Free plan
          </p>
          <h2 className="font-heading text-xl font-black">Usage remaining</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-paper-muted text-lg font-black shadow-brutal-sm">
          ⚡
        </div>
      </div>
      <div className="grid gap-4">
        <Progress
          label="AI generations"
          value={3}
          max={10}
          description="3 of 10 free AI generations used."
        />
        <Progress
          label="Materials uploaded"
          value={1}
          max={5}
          indicatorClassName="bg-accent-blue"
          description="1 of 5 free material uploads used."
        />
        <Progress
          label="Flashcard decks"
          value={1}
          max={3}
          indicatorClassName="bg-accent-green"
          description="1 of 3 free flashcard decks used."
        />
      </div>
      <p className="mt-4 text-xs font-semibold text-zinc-400">
        Usage remaining is a visual placeholder for Day 2.
      </p>
    </section>
  );
}
