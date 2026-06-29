import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { DashboardProgressEvent } from "@/types/dashboard";

const typeBadge: Record<
  DashboardProgressEvent["type"],
  { variant: BadgeVariant; label: string }
> = {
  roadmap: { variant: "yellow", label: "Roadmap" },
  quiz: { variant: "pink", label: "Quiz" },
  flashcard: { variant: "green", label: "Flashcards" },
  interview: { variant: "pink", label: "Interview" },
  material: { variant: "blue", label: "Material" },
  other: { variant: "neutral", label: "Progress" },
};

function formatEventDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type ProgressEventListProps = {
  events: DashboardProgressEvent[];
};

export function ProgressEventList({ events }: ProgressEventListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-6 text-sm font-black shadow-brutal-sm">
        No progress yet.
      </div>
    );
  }

  return (
    <section aria-label="Learning progress events">
      <ol className="grid gap-3" role="list">
        {events.map((event) => {
          const badge = typeBadge[event.type];
          return (
            <li
              key={event.id}
              className="flex items-start justify-between gap-3 rounded-md border-2 border-black bg-paper-base px-4 py-3 shadow-brutal-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">
                  {event.label}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  {formatEventDate(event.occurred_at)}
                </p>
              </div>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </li>
          );
        })}
      </ol>
    </section>
  );
}