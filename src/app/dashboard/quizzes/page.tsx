import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { QuizzesSection } from "@/features/quizzes/components/quizzes-section";
import { getCurrentProfile } from "@/lib/auth/session";
import { listCompletedMaterialRoadmapOptions } from "@/lib/materials/queries";
import { listQuizViews } from "@/lib/quizzes/queries";

export const metadata: Metadata = {
  title: `Quizzes — ${siteConfig.name}`,
  description:
    "Practice with AI-generated multiple-choice quizzes from your uploaded notes.",
};

export default async function QuizzesPage() {
  const [quizzesResult, materialsResult, profile] = await Promise.all([
    listQuizViews(),
    listCompletedMaterialRoadmapOptions(),
    getCurrentProfile(),
  ]);

  return (
    <DashboardShell
      activePath={dashboardRoutes.quizzes}
      description="Practice from your own notes with AI-generated multiple choice quizzes."
      title="Quizzes"
    >
      {!quizzesResult.ok ? (
        <ErrorState
          description="Please refresh the page or sign in again before generating quizzes."
          title="Could not load quizzes."
        />
      ) : (
        <QuizzesSection
          quizzes={quizzesResult.data}
          materials={materialsResult.ok ? materialsResult.data : []}
          defaultQuizDifficulty={profile?.default_quiz_difficulty ?? "beginner"}
        />
      )}
    </DashboardShell>
  );
}