import { Section } from "@/components/layout";
import { FeatureCard } from "./feature-card";

const features = [
  {
    title: "Materials",
    label: "Blue",
    accent: "blue",
    description: "Upload PDFs, text notes, or pasted study material as the future source layer.",
  },
  {
    title: "Roadmaps",
    label: "Yellow",
    accent: "yellow",
    description: "Generate a clear roadmap before you start randomly studying.",
  },
  {
    title: "Flashcards",
    label: "Green",
    accent: "green",
    description: "Practice recall with physical-feeling revision cards.",
  },
  {
    title: "Quizzes",
    label: "Pink",
    accent: "pink",
    description: "Check understanding with question cards and visible explanations.",
  },
  {
    title: "Interview",
    label: "Pink + black",
    accent: "dark",
    description: "Practice explaining concepts with structured mock interview prompts.",
  },
  {
    title: "RAG Chat",
    label: "Blue",
    accent: "blue",
    description: "Designed for note-grounded answers from uploaded material.",
  },
  {
    title: "Progress",
    label: "Green",
    accent: "green",
    description: "Track roadmap tasks, practice attempts, and learning momentum.",
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            accent={feature.accent}
            description={feature.description}
            key={feature.title}
            label={feature.label}
            title={feature.title}
          />
        ))}
      </div>
    </Section>
  );
}
