import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Section } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

const problems = [
  {
    title: "Scattered notes",
    copy: "PDFs, pasted text, lecture notes, and tutorials live in separate places with no study flow.",
    hoverColor: "hover-text-blue",
  },
  {
    title: "Unclear path",
    copy: "Learners often start randomly instead of following a practical roadmap from the material they already have.",
    hoverColor: "hover-text-yellow",
  },
  {
    title: "Passive reading",
    copy: "Reading notes feels productive, but it does not always turn into recall, quizzes, or explanation practice.",
    hoverColor: "hover-text-green",
  },
  {
    title: "Weak interview answers",
    copy: "Knowing a topic is different from explaining it clearly under interview pressure.",
    hoverColor: "hover-text-pink",
  },
] as const;

export function ProblemSection() {
  return (
    <Section
      description="SkillForge AI is designed around the real learning loop: organize the material, practice from it, and see what still needs work."
      eyebrow="The learner problem"
      title="Notes are useful only after they become a system."
      variant="muted"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {problems.map((problem, index) => {
          const splitClass =
            index === 0
              ? "split-card-left"
              : index === 3
                ? "split-card-right"
                : "split-card-center";
          return (
            <Card className={cn("bg-paper-base liftable", splitClass)} key={problem.title}>
              <CardHeader>
                <CardTitle className={cn("text-xl transition-colors duration-200", problem.hoverColor)}>
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium leading-7">{problem.copy}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
