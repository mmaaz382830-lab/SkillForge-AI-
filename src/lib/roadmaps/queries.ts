import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  LearningGoal,
  Roadmap,
  RoadmapActionResult,
  RoadmapDetailView,
  RoadmapTask,
  RoadmapView,
} from "@/types/roadmaps";

import { calculateRoadmapProgress } from "./progress";

const ROADMAP_SELECT =
  "id,user_id,goal_id,title,description,difficulty,estimated_duration,ai_generated,created_at,updated_at";
const TASK_SELECT =
  "id,roadmap_id,user_id,title,description,status,order_index,estimated_time,completed_at,created_at,updated_at";
const GOAL_SELECT =
  "id,user_id,title,description,category,difficulty,target_date,created_at,updated_at";

export async function getAuthenticatedUserId(): Promise<
  RoadmapActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: "Please log in to continue.",
    };
  }

  return {
    ok: true,
    data: data.user.id,
  };
}

export async function listLearningGoals(): Promise<
  RoadmapActionResult<LearningGoal[]>
> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .select(GOAL_SELECT)
    .eq("user_id", user.data)
    .order("created_at", { ascending: false })
    .returns<LearningGoal[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load goals.",
    };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function listRoadmaps(): Promise<RoadmapActionResult<Roadmap[]>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT)
    .eq("user_id", user.data)
    .order("created_at", { ascending: false })
    .returns<Roadmap[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load roadmaps.",
    };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function listRoadmapViews(): Promise<
  RoadmapActionResult<RoadmapView[]>
> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const [roadmapsResult, goalsResult, tasksResult] = await Promise.all([
    supabase
      .from("roadmaps")
      .select(ROADMAP_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .returns<Roadmap[]>(),
    supabase
      .from("learning_goals")
      .select("id,title")
      .eq("user_id", user.data)
      .returns<Array<Pick<LearningGoal, "id" | "title">>>(),
    supabase
      .from("roadmap_tasks")
      .select("id,roadmap_id,status")
      .eq("user_id", user.data)
      .returns<Array<Pick<RoadmapTask, "id" | "roadmap_id" | "status">>>(),
  ]);

  if (roadmapsResult.error) {
    return {
      ok: false,
      error: "Could not load roadmaps.",
    };
  }

  if (goalsResult.error || tasksResult.error) {
    return {
      ok: false,
      error: "Could not load roadmap details.",
    };
  }

  const goalTitleById = new Map(
    (goalsResult.data ?? []).map((goal) => [goal.id, goal.title]),
  );
  const tasksByRoadmapId = new Map<
    string,
    Array<Pick<RoadmapTask, "status">>
  >();

  for (const task of tasksResult.data ?? []) {
    const tasks = tasksByRoadmapId.get(task.roadmap_id) ?? [];
    tasks.push({ status: task.status });
    tasksByRoadmapId.set(task.roadmap_id, tasks);
  }

  return {
    ok: true,
    data: (roadmapsResult.data ?? []).map((roadmap) => {
      const tasks = tasksByRoadmapId.get(roadmap.id) ?? [];
      const progress = calculateRoadmapProgress(tasks);

      return {
        id: roadmap.id,
        goal_id: roadmap.goal_id,
        goal_title: roadmap.goal_id
          ? (goalTitleById.get(roadmap.goal_id) ?? null)
          : null,
        title: roadmap.title,
        description: roadmap.description,
        difficulty: roadmap.difficulty,
        estimated_duration: roadmap.estimated_duration,
        ai_generated: roadmap.ai_generated,
        created_at: roadmap.created_at,
        updated_at: roadmap.updated_at,
        task_count: progress.total,
        completed_task_count: progress.completed,
        progress_percentage: progress.percentage,
      };
    }),
  };
}

export async function getRoadmapById(
  id: string,
): Promise<RoadmapActionResult<RoadmapDetailView>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT)
    .eq("id", id)
    .eq("user_id", user.data)
    .maybeSingle<Roadmap>();

  if (roadmapError) {
    return {
      ok: false,
      error: "Could not load roadmap.",
    };
  }

  if (!roadmap) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const [tasksResult, goalResult] = await Promise.all([
    supabase
      .from("roadmap_tasks")
      .select(TASK_SELECT)
      .eq("roadmap_id", id)
      .eq("user_id", user.data)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<RoadmapTask[]>(),
    roadmap.goal_id
      ? supabase
          .from("learning_goals")
          .select("id,title")
          .eq("id", roadmap.goal_id)
          .eq("user_id", user.data)
          .maybeSingle<Pick<LearningGoal, "id" | "title">>()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (tasksResult.error) {
    return {
      ok: false,
      error: "Could not load roadmap tasks.",
    };
  }

  if (goalResult.error) {
    return {
      ok: false,
      error: "Could not load roadmap details.",
    };
  }

  const safeTasks = (tasksResult.data ?? []).map((task) => ({
    id: task.id,
    roadmap_id: task.roadmap_id,
    title: task.title,
    description: task.description,
    status: task.status,
    order_index: task.order_index,
    estimated_time: task.estimated_time,
    completed_at: task.completed_at,
    created_at: task.created_at,
    updated_at: task.updated_at,
  }));

  return {
    ok: true,
    data: {
      id: roadmap.id,
      goal_id: roadmap.goal_id,
      goal_title: goalResult.data?.title ?? null,
      title: roadmap.title,
      description: roadmap.description,
      difficulty: roadmap.difficulty,
      estimated_duration: roadmap.estimated_duration,
      ai_generated: roadmap.ai_generated,
      created_at: roadmap.created_at,
      updated_at: roadmap.updated_at,
      tasks: safeTasks,
      progress: calculateRoadmapProgress(safeTasks),
    },
  };
}

export async function verifyLearningGoalOwnership(
  goalId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .select("id")
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  return !error && Boolean(data);
}

export async function verifyRoadmapOwnership(
  roadmapId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  return !error && Boolean(data);
}

export async function getOwnedTask(
  taskId: string,
  userId: string,
): Promise<RoadmapTask | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmap_tasks")
    .select(TASK_SELECT)
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle<RoadmapTask>();

  if (error) {
    return null;
  }

  return data;
}





