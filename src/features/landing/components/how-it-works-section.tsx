import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Section } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

const steps = [
  {
    label: "Upload",
    title: "Add study material",
    copy: "Bring PDFs, text notes, or pasted material into one learning workspace.",
    accent: "blue",
  },
  {
    label: "Generate",
    title: "Create a roadmap",
    copy: "Generate a clear study path before you start randomly revising.",
    accent: "yellow",
  },
  {
    label: "Practice",
    title: "Turn notes into recall",
    copy: "Use flashcards, quizzes, and mock interview prompts to test understanding.",
    accent: "pink",
  },
  {
    label: "Track",
    title: "Watch progress",
    copy: "Keep task completion, practice history, and learning momentum visible.",
    accent: "green",
  },
] as const;

const badgeVariant = {
  blue: "blue",
  yellow: "yellow",
  pink: "pink",
  green: "green",
} as const;

const accentClass = {
  blue: "bg-accent-blue",
  yellow: "bg-accent-yellow",
  pink: "bg-accent-pink",
  green: "bg-accent-green",
} as const;

export function HowItWorksSection() {
  return (
    <Section
      description="Follow our structured study system to organize your learning and practice efficiently."
      eyebrow="How it works"
      id="how-it-works"
      title="Upload, generate, practice, track."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const splitClass =
            index === 0
              ? "split-card-left"
              : index === 3
                ? "split-card-right"
                : "split-card-center";
          return (
            <Card className={cn(accentClass[step.accent], splitClass)} key={step.label}>
              <CardHeader>
                <Badge variant={badgeVariant[step.accent]}>
                  {String(index + 1).padStart(2, "0")} · {step.label}
                </Badge>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium leading-7">{step.copy}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
