import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateRoadmapProgress } from "@/lib/roadmaps/progress";
import { getAuthenticatedUserId } from "@/lib/roadmaps/queries";
import type {
  DashboardProgressSummary,
  DashboardRoadmapSummary,
} from "@/types/dashboard";
import type {
  LearningGoal,
  Roadmap,
  RoadmapActionResult,
  RoadmapTask,
} from "@/types/roadmaps";

const ROADMAP_SELECT =
  "id, user_id, goal_id, title, description, difficulty, estimated_duration, ai_generated, created_at, updated_at";

type DashboardGoalRow = Pick<LearningGoal, "id" | "title">;
type DashboardTaskRow = Pick<RoadmapTask, "id" | "roadmap_id" | "status">;

function buildRoadmapSummary(
  roadmap: Roadmap,
  goalTitleById: Map<string, string>,
  tasksByRoadmapId: Map<string, DashboardTaskRow[]>,
): DashboardRoadmapSummary {
  const tasks = tasksByRoadmapId.get(roadmap.id) ?? [];
  const progress = calculateRoadmapProgress(tasks);

  return {
    id: roadmap.id,
    title: roadmap.title,
    difficulty: roadmap.difficulty,
    goal_title: roadmap.goal_id
      ? (goalTitleById.get(roadmap.goal_id) ?? null)
      : null,
    task_count: progress.total,
    completed_task_count: progress.completed,
    progress_percentage: progress.percentage,
  };
}

export async function getDashboardProgress(): Promise<
  RoadmapActionResult<DashboardProgressSummary>
> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();

  const [goalsResult, roadmapsResult, tasksResult] = await Promise.all([
    supabase
      .from("learning_goals")
      .select("id, title")
      .eq("user_id", user.data)
      .returns<DashboardGoalRow[]>(),
    supabase
      .from("roadmaps")
      .select(ROADMAP_SELECT)
      .eq("user_id", user.data)
      .order("updated_at", { ascending: false })
      .returns<Roadmap[]>(),
    supabase
      .from("roadmap_tasks")
      .select("id, roadmap_id, status")
      .eq("user_id", user.data)
      .returns<DashboardTaskRow[]>(),
  ]);

  if (goalsResult.error || roadmapsResult.error || tasksResult.error) {
    return {
      ok: false,
      error: "Could not load dashboard progress.",
    };
  }

  const goals = goalsResult.data ?? [];
  const roadmaps = roadmapsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const overallProgress = calculateRoadmapProgress(tasks);
  const goalTitleById = new Map(goals.map((goal) => [goal.id, goal.title]));
  const tasksByRoadmapId = new Map<string, DashboardTaskRow[]>();

  for (const task of tasks) {
    const existingTasks = tasksByRoadmapId.get(task.roadmap_id) ?? [];
    existingTasks.push(task);
    tasksByRoadmapId.set(task.roadmap_id, existingTasks);
  }

  const currentRoadmap = roadmaps[0]
    ? buildRoadmapSummary(roadmaps[0], goalTitleById, tasksByRoadmapId)
    : null;

  return {
    ok: true,
    data: {
      learning_goal_count: goals.length,
      roadmap_count: roadmaps.length,
      roadmap_task_count: overallProgress.total,
      completed_task_count: overallProgress.completed,
      overall_progress_percentage: overallProgress.percentage,
      current_roadmap: currentRoadmap,
    },
  };
}

