import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type RoadmapCardProps = {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  taskCount: number;
  completedCount: number;
};

const difficultyVariant: Record<string, "green" | "yellow" | "pink"> = {
  Beginner: "green",
  Intermediate: "yellow",
  Advanced: "pink",
};

/**
 * RoadmapCard — visual-only roadmap summary card.
 * Shows title, difficulty, progress bar, task count. No real CRUD.
 */
export function RoadmapCard({
  title,
  difficulty,
  estimatedDuration,
  taskCount,
  completedCount,
}: RoadmapCardProps) {
  return (
    <article className="brutal-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-black leading-tight">
          {title}
        </h3>
        <div className="flex gap-2">
          <Badge variant={difficultyVariant[difficulty] ?? "neutral"}>
            {difficulty}
          </Badge>
          <Badge variant="yellow">AI Generated</Badge>
        </div>
      </div>
      <Progress
        label="Roadmap progress"
        value={completedCount}
        max={taskCount}
        indicatorClassName="bg-accent-yellow"
      />
      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold text-zinc-600">
        <span>
          {completedCount} of {taskCount} tasks
        </span>
        <span>{estimatedDuration}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-accent-yellow px-3 py-1.5 text-xs font-black shadow-brutal-sm"
        >
          View roadmap
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-paper-base px-3 py-1.5 text-xs font-black shadow-brutal-sm"
        >
          Continue
        </button>
      </div>
    </article>
  );
}
