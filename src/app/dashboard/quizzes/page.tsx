import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { QuizzesSection } from "@/features/quizzes/components/quizzes-section";
import { listCompletedMaterialRoadmapOptions } from "@/lib/materials/queries";
import { listQuizViews } from "@/lib/quizzes/queries";

export const metadata: Metadata = {
  title: `Quizzes — ${siteConfig.name}`,
  description:
    "Practice with AI-generated multiple-choice quizzes from your uploaded notes.",
};

/**
 * /dashboard/quizzes — AI quiz generation, list, and preview.
 * No quiz attempt, scoring, or wrong-answer review (Day 8).
 */
export default async function QuizzesPage() {
  const [quizzesResult, materialsResult] = await Promise.all([
    listQuizViews(),
    listCompletedMaterialRoadmapOptions(),
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
        />
      )}
    </DashboardShell>
  );
}
