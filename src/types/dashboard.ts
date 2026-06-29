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

export type DashboardProgressEvent = {
  id: string;
  label: string;
  occurred_at: string;
  type: "quiz" | "roadmap" | "flashcard" | "interview" | "material" | "other";
};

export type DashboardProgressSummary = {
  learning_goal_count: number;
  material_count: number;
  roadmap_count: number;
  roadmap_task_count: number;
  completed_task_count: number;
  overall_progress_percentage: number;
  quiz_attempt_count: number;
  latest_quiz_score: number | null;
  completed_interview_count: number;
  latest_interview_score: number | null;
  recent_events: DashboardProgressEvent[];
  current_roadmap: DashboardRoadmapSummary | null;
};