import { Section } from "@/components/layout";
import { FeatureCard } from "./feature-card";

const features = [
  {
    title: "Materials",
    label: "SOURCE MATERIALS",
    accent: "blue",
    description: "Upload PDFs, text notes, or pasted study material as your private source layer.",
  },
  {
    title: "Roadmaps",
    label: "LEARNING PLAN",
    accent: "yellow",
    description: "Turn your notes and goals into a clear checklist for what to learn next.",
  },
  {
    title: "Flashcards",
    label: "ACTIVE RECALL",
    accent: "green",
    description: "Practice recall with focused front/back cards generated from your material.",
  },
  {
    title: "Quizzes",
    label: "PRACTICE TESTS",
    accent: "pink",
    description: "Check understanding with multiple-choice questions and answer review.",
  },
  {
    title: "Interview",
    label: "INTERVIEW PREP",
    accent: "dark",
    description: "Practice technical explanations with structured mock questions and feedback.",
  },
  {
    title: "RAG Chat",
    label: "NOTE CHAT",
    accent: "blue",
    description: "Ask questions from your prepared notes and keep answers tied to your material.",
  },
  {
    title: "Progress",
    label: "LEARNING MOMENTUM",
    accent: "green",
    description: "Track roadmap tasks, practice attempts, and learning momentum in one place.",
  },
] as const;

export function FeatureGridSection() {
  return (
    <Section
      description="Each feature block maps to a learning job, not generic AI productivity."
      eyebrow="Feature cards"
      id="features"
      title="Everything points back to study practice."
      variant="muted"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {features.map((feature, index) => {
          const splitClass =
            index % 3 === 0
              ? "split-card-left"
              : index % 3 === 1
                ? "split-card-center"
                : "split-card-right";
          return (
            <FeatureCard
              accent={feature.accent}
              description={feature.description}
              key={feature.title}
              label={feature.label}
              title={feature.title}
              className={splitClass}
            />
          );
        })}
      </div>
    </Section>
  );
}