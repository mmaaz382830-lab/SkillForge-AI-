import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { LearningGoalsSection } from "@/features/roadmaps/components/learning-goals-section";
import { RoadmapsSection } from "@/features/roadmaps/components/roadmaps-section";
import { listLearningGoals, listRoadmapViews } from "@/lib/roadmaps/queries";
import type {
  LearningGoal,
  LearningGoalOption,
  LearningGoalView,
} from "@/types/roadmaps";

export const metadata: Metadata = {
  title: `Learning Roadmaps — ${siteConfig.name}`,
  description: "Create learning goals and prepare structured SkillForge AI roadmaps.",
};

function toGoalView(goal: LearningGoal): LearningGoalView {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    difficulty: goal.difficulty,
    target_date: goal.target_date,
    created_at: goal.created_at,
    updated_at: goal.updated_at,
  };
}

function toGoalOption(goal: LearningGoal): LearningGoalOption {
  return {
    id: goal.id,
    title: goal.title,
  };
}

export default async function RoadmapsPage() {
  const [goalsResult, roadmapsResult] = await Promise.all([
    listLearningGoals(),
    listRoadmapViews(),
  ]);
  const goalOptions = goalsResult.ok ? goalsResult.data.map(toGoalOption) : [];

  return (
    <DashboardShell
      activePath={dashboardRoutes.roadmaps}
      description="Create goals first, then turn them into structured roadmap checklists."
      title="Learning Roadmaps"
    >
      {!goalsResult.ok ? (
        <ErrorState
          description="Please refresh the page or sign in again before creating a roadmap goal."
          title="Could not load learning goals."
        />
      ) : (
        <LearningGoalsSection goals={goalsResult.data.map(toGoalView)} />
      )}

      {!roadmapsResult.ok ? (
        <ErrorState
          description="Please refresh the page before creating or editing roadmaps."
          title="Could not load roadmaps."
        />
      ) : (
        <RoadmapsSection goals={goalOptions} roadmaps={roadmapsResult.data} />
      )}
    </DashboardShell>
  );
}
