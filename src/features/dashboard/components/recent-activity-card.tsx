import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  label: string;
  time: string;
  badge: "blue" | "yellow" | "green" | "pink" | "neutral";
  badgeText: string;
};

const STATIC_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    label: "Uploaded \"JavaScript Notes.pdf\"",
    time: "Just now",
    badge: "blue",
    badgeText: "Material",
  },
  {
    id: "2",
    label: "Generated roadmap \"Async/Await Mastery\"",
    time: "2 min ago",
    badge: "yellow",
    badgeText: "Roadmap",
  },
  {
    id: "3",
    label: "Completed quiz — 8/10 correct",
    time: "15 min ago",
    badge: "pink",
    badgeText: "Quiz",
  },
  {
    id: "4",
    label: "Created 20 flashcards from notes",
    time: "1 hr ago",
    badge: "green",
    badgeText: "Flashcards",
  },
  {
    id: "5",
    label: "Mock interview — Promises & closures",
    time: "Yesterday",
    badge: "pink",
    badgeText: "Interview",
  },
];

/**
 * RecentActivityCard — visual-only static recent activity list.
 * No real data. Designed dashboard preview only.
 */
export function RecentActivityCard() {
  return (
    <section className="brutal-card p-5 sm:p-6" aria-label="Recent activity">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-black">Recent activity</h2>
        <span className="rounded-md border-2 border-black bg-accent-blue px-2 py-1 text-xs font-black uppercase shadow-brutal-sm">
          Designed preview
        </span>
      </div>
      <ol className="grid gap-3" role="list">
        {STATIC_ACTIVITIES.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-md border-2 border-black bg-paper-muted px-3 py-2"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-sm font-semibold leading-tight">
                {item.label}
              </span>
              <span className="text-xs font-medium text-zinc-500">
                {item.time}
              </span>
            </div>
            <Badge variant={item.badge}>{item.badgeText}</Badge>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs font-semibold text-zinc-400">
        Designed dashboard preview — real data connects in later phases.
      </p>
    </section>
  );
}
