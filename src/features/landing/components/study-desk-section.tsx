import { Badge } from "@/components/ui";
import { Section } from "@/components/layout";

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
      description="The landing shell uses the same physical-card metaphor planned for the future app screens."
      eyebrow="Learning modes"
      title="A digital study desk, not another chat box."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {deskCards.map(([title, copy], index) => (
          <div
            className="brutal-card liftable bg-paper-base p-5"
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
        ))}
      </div>
    </Section>
  );
}
