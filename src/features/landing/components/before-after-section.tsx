import { Badge } from "@/components/ui";
import { Section } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

const columns = [
  {
    title: "Before",
    badge: "MESSY INPUTS",
    accent: "bg-accent-pink",
    items: [
      "Scattered PDFs",
      "Copied notes",
      "Random tutorials",
      "No clear plan",
    ],
  },
  {
    title: "After",
    badge: "STUDY WORKFLOW",
    accent: "bg-accent-green",
    items: [
      "Roadmap",
      "Flashcards",
      "Quiz practice",
      "Interview prep",
      "Progress tracking",
    ],
  },
] as const;

export function BeforeAfterSection() {
  return (
    <Section
      description="SkillForge keeps the same material, but turns it into a sequence you can actually work through."
      eyebrow="Before and after"
      title="From messy notes to a study workflow."
      variant="blue"
    >
      <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
        {columns.map((column, index) => (
          <div
            className={cn(
              "brutal-card liftable grid min-w-0 gap-4 bg-paper-base p-4 sm:gap-5 sm:p-7",
              index === 0 ? "split-card-left" : "split-card-right",
            )}
            key={column.title}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-black sm:text-3xl">{column.title}</h3>
              <Badge variant={index === 0 ? "pink" : "green"}>
                {column.badge}
              </Badge>
            </div>
            <div className="grid gap-3">
              {column.items.map((item) => (
                <div
                  className="flex min-w-0 items-center gap-3 rounded-lg border-2 border-black bg-paper-muted p-3 text-sm font-black shadow-brutal-sm sm:text-base"
                  key={item}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md border-2 border-black font-black leading-none",
                      column.accent,
                    )}
                  >
                    {index === 0 ? "-" : "+"}
                  </span>
                  <span className="min-w-0">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
