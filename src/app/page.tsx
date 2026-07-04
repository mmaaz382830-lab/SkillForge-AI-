import {
  BeforeAfterSection,
  FeatureGridSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
  StudyDeskSection,
} from "@/features/landing/components";
import { PublicShell } from "@/components/layout";

export default function Home() {
  return (
    <PublicShell>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeatureGridSection />
      <StudyDeskSection />
      <BeforeAfterSection />
      <FinalCtaSection />
    </PublicShell>
  );
}
