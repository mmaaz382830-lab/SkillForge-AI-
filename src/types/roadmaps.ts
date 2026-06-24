import type { DifficultyLevel } from "./app";

export type RoadmapTaskStatus = "todo" | "in_progress" | "completed";

export type LearningGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: DifficultyLevel;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

export type LearningGoalView = Omit<LearningGoal, "user_id">;

export type LearningGoalOption = Pick<LearningGoal, "id" | "title">;

export type Roadmap = {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  estimated_duration: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type RoadmapView = Omit<Roadmap, "user_id"> & {
  goal_title: string | null;
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
};

export type RoadmapTask = {
  id: string;
  roadmap_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: RoadmapTaskStatus;
  order_index: number;
  estimated_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RoadmapTaskView = Omit<RoadmapTask, "user_id">;

export type ProgressEvent = {
  id: string;
  user_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type LearningGoalInput = {
  title: string;
  description?: string | null;
  category?: string | null;
  difficulty?: DifficultyLevel;
  target_date?: string | null;
};

export type RoadmapInput = {
  title: string;
  description?: string | null;
  difficulty?: DifficultyLevel;
  estimated_duration?: string | null;
  goal_id?: string | null;
};

export type RoadmapTaskInput = {
  title: string;
  description?: string | null;
  status?: RoadmapTaskStatus;
  order_index: number;
  estimated_time?: string | null;
};

export type RoadmapWithTasks = Roadmap & {
  tasks: RoadmapTask[];
  progress: RoadmapProgress;
};

export type RoadmapDetailView = Omit<Roadmap, "user_id"> & {
  goal_title: string | null;
  tasks: RoadmapTaskView[];
  progress: RoadmapProgress;
};

export type RoadmapProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type RoadmapActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };


