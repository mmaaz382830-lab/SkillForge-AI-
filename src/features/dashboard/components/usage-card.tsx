import { Progress } from "@/components/ui/progress";
import { getUsageSummary, type AiFeatureType } from "@/lib/ai/usage";

const FEATURE_LABELS: Record<AiFeatureType, string> = {
  roadmap: "Roadmaps",
  flashcards: "Flashcards",
  quiz: "Quizzes",
  interview: "Interviews",
  chat: "RAG chat",
  embeddings: "Material indexing",
};

const FEATURE_ACCENTS: Partial<Record<AiFeatureType, string>> = {
  chat: "bg-accent-blue",
  embeddings: "bg-accent-blue",
  flashcards: "bg-accent-green",
  interview: "bg-accent-pink",
  quiz: "bg-accent-pink",
  roadmap: "bg-accent-yellow",
};

function formatPlan(plan: string) {
  return plan
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatPeriod(period: "day" | "month") {
  return period === "day" ? "today" : "this month";
}

export async function UsageCard() {
  const summary = await getUsageSummary();

  return (
    <section className="brutal-card p-5 sm:p-6" aria-label="Usage remaining">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
            {formatPlan(summary.plan)} plan
          </p>
          <h2 className="font-heading text-xl font-black">Usage remaining</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-paper-muted text-lg font-black shadow-brutal-sm">
          U
        </div>
      </div>
      <div className="grid gap-4">
        {summary.items.map((item) => (
          <Progress
            key={item.featureType}
            label={FEATURE_LABELS[item.featureType]}
            value={item.used}
            max={item.limit}
            indicatorClassName={FEATURE_ACCENTS[item.featureType]}
            description={`${item.used} of ${item.limit} used ${formatPeriod(item.period)}.`}
          />
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-zinc-500">
        Usage is calculated from successful AI actions in usage logs. Blocked
        requests do not consume usage.
      </p>
    </section>
  );
}