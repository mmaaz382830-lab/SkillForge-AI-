import { Badge } from "@/components/ui";
import { Section } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

const deskCards = [
  ["Note card", "Key definitions and source snippets stay readable."],
  ["Checklist card", "Roadmap tasks become concrete next actions."],
  ["Flashcard", "Recall practice gets its own physical card surface."],
  ["Quiz card", "Question practice is separated from passive reading."],
  ["Feedback sheet", "Interview answers get structured improvement notes."],
] as const;

export function StudyDeskSection() {
  return (
    <Section
      description="The workspace uses physical-feeling cards for notes, tasks, quizzes, flashcards, and interview practice."
      eyebrow="Learning modes"
      title="A digital study desk, not another chat box."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {deskCards.map(([title, copy], index) => {
          const splitClass =
            index < 2
              ? "split-card-left"
              : index === 2
                ? "split-card-center"
                : "split-card-right";
          return (
            <div
              className={cn("brutal-card liftable bg-paper-base p-5", splitClass)}
              key={title}
            >
              <Badge
                variant={
                  index % 4 === 0
                    ? "blue"
                    : index % 4 === 1
                      ? "yellow"
                      : index % 4 === 2
                        ? "green"
                        : "pink"
                }
              >
                {title}
              </Badge>
              <p className="mt-5 font-black leading-7">{copy}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
