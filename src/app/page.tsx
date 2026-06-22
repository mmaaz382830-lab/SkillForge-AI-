import {
  FeatureGridSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  ProblemSection,
  SourceGroundedSection,
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
      <SourceGroundedSection />
      <StudyDeskSection />
      <PricingSection />
      <FinalCtaSection />
    </PublicShell>
  );
}
