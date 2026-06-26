import type { DifficultyLevel } from "./app";

export type DashboardRoadmapSummary = {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  goal_title: string | null;
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
};

export type DashboardProgressSummary = {
  learning_goal_count: number;
  material_count: number;
  roadmap_count: number;
  roadmap_task_count: number;
  completed_task_count: number;
  overall_progress_percentage: number;
  current_roadmap: DashboardRoadmapSummary | null;
};
