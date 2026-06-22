import { Badge } from "@/components/ui/badge";

type ProgressEvent = {
  id: string;
  label: string;
  date: string;
  type: "quiz" | "roadmap" | "flashcard" | "interview" | "material";
};

const STATIC_EVENTS: ProgressEvent[] = [
  {
    id: "1",
    label: "Completed \"JavaScript Basics\" roadmap — 12/12 tasks",
    date: "Today",
    type: "roadmap",
  },
  {
    id: "2",
    label: "Quiz passed — 9/10 correct on Promises",
    date: "Today",
    type: "quiz",
  },
  {
    id: "3",
    label: "Reviewed 30 flashcards in \"Async/Await\" deck",
    date: "Yesterday",
    type: "flashcard",
  },
  {
    id: "4",
    label: "Mock interview completed — 7/10 score",
    date: "2 days ago",
    type: "interview",
  },
  {
    id: "5",
    label: "Uploaded \"React Hooks Notes.pdf\"",
    date: "3 days ago",
    type: "material",
  },
];

const typeBadge: Record<ProgressEvent["type"], { variant: "yellow" | "pink" | "green" | "blue" | "neutral"; label: string }> =
  {
    roadmap: { variant: "yellow", label: "Roadmap" },
    quiz: { variant: "pink", label: "Quiz" },
    flashcard: { variant: "green", label: "Flashcards" },
    interview: { variant: "pink", label: "Interview" },
    material: { variant: "blue", label: "Material" },
  };

/**
 * ProgressEventList — visual-only static learning progress events.
 * No real analytics. Designed preview only.
 */
export function ProgressEventList() {
  return (
    <section aria-label="Learning progress events">
      <ol className="grid gap-3" role="list">
        {STATIC_EVENTS.map((event) => {
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
                  {event.date}
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
