import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Section } from "@/components/layout";

const problems = [
  {
    title: "Scattered notes",
    copy: "PDFs, pasted text, lecture notes, and tutorials live in separate places with no study flow.",
  },
  {
    title: "Unclear path",
    copy: "Learners often start randomly instead of following a practical roadmap from the material they already have.",
  },
  {
    title: "Passive reading",
    copy: "Reading notes feels productive, but it does not always turn into recall, quizzes, or explanation practice.",
  },
  {
    title: "Weak interview answers",
    copy: "Knowing a topic is different from explaining it clearly under interview pressure.",
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem) => (
          <Card className="bg-paper-base" key={problem.title}>
            <CardHeader>
              <CardTitle className="text-xl">{problem.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium leading-7">{problem.copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
