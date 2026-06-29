import { calculateRoadmapProgress } from "@/lib/roadmaps/progress";
import { getAuthenticatedUserId } from "@/lib/roadmaps/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardProgressEvent,
  DashboardProgressSummary,
  DashboardRoadmapSummary,
} from "@/types/dashboard";
import type { ProgressEvent } from "@/types/roadmaps";
import type {
  LearningGoal,
  Roadmap,
  RoadmapActionResult,
  RoadmapTask,
} from "@/types/roadmaps";

const ROADMAP_SELECT =
  "id, user_id, goal_id, title, description, difficulty, estimated_duration, ai_generated, created_at, updated_at";

const PROGRESS_EVENT_SELECT =
  "id,user_id,event_type,entity_type,entity_id,metadata,created_at";

type DashboardGoalRow = Pick<LearningGoal, "id" | "title">;
type DashboardTaskRow = Pick<RoadmapTask, "id" | "roadmap_id" | "status">;
type QuizAttemptStatRow = {
  id: string;
  score: number;
  completed_at: string | null;
};
type InterviewSessionStatRow = {
  id: string;
  score: number | null;
  completed_at: string | null;
};

type ProgressMetadata = Record<string, unknown>;

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

function getMetadataString(metadata: ProgressMetadata, key: string): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getMetadataNumber(metadata: ProgressMetadata, key: string): number | null {
  const value = metadata[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildProgressEventLabel(event: ProgressEvent): DashboardProgressEvent {
  const metadata = event.metadata ?? {};

  if (event.event_type === "quiz_attempted") {
    const title = getMetadataString(metadata, "quiz_title") ?? "Quiz";
    const correctCount = getMetadataNumber(metadata, "correct_count");
    const totalQuestions = getMetadataNumber(metadata, "total_questions");
    const score = getMetadataNumber(metadata, "score");
    const result =
      correctCount != null && totalQuestions != null
        ? `${correctCount}/${totalQuestions}`
        : score != null
          ? `${score}%`
          : "completed";

    return {
      id: event.id,
      label: `Quiz attempted: ${title} (${result})`,
      occurred_at: event.created_at,
      type: "quiz",
    };
  }

  if (event.event_type === "interview_completed") {
    const topic = getMetadataString(metadata, "topic") ?? "Interview";
    const score = getMetadataNumber(metadata, "score");
    const questionCount = getMetadataNumber(metadata, "question_count");
    const scoreLabel = score == null ? "completed" : `${score}/10`;
    const questionLabel = questionCount == null ? "" : ` across ${questionCount} questions`;

    return {
      id: event.id,
      label: `Interview completed: ${topic} (${scoreLabel}${questionLabel})`,
      occurred_at: event.created_at,
      type: "interview",
    };
  }

  if (event.event_type === "task_completed") {
    const title = getMetadataString(metadata, "task_title") ?? "Roadmap task";

    return {
      id: event.id,
      label: `Roadmap task completed: ${title}`,
      occurred_at: event.created_at,
      type: "roadmap",
    };
  }

  return {
    id: event.id,
    label: event.event_type.replaceAll("_", " "),
    occurred_at: event.created_at,
    type: "other",
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

  const [
    goalsResult,
    roadmapsResult,
    tasksResult,
    materialCountResult,
    quizAttemptCountResult,
    latestQuizAttemptResult,
    completedInterviewCountResult,
    latestInterviewResult,
    recentEventsResult,
  ] = await Promise.all([
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
    supabase
      .from("materials")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.data)
      .is("deleted_at", null),
    supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.data),
    supabase
      .from("quiz_attempts")
      .select("id,score,completed_at")
      .eq("user_id", user.data)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle<QuizAttemptStatRow>(),
    supabase
      .from("interview_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.data)
      .eq("status", "completed"),
    supabase
      .from("interview_sessions")
      .select("id,score,completed_at")
      .eq("user_id", user.data)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle<InterviewSessionStatRow>(),
    supabase
      .from("progress_events")
      .select(PROGRESS_EVENT_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<ProgressEvent[]>(),
  ]);

  if (
    goalsResult.error ||
    roadmapsResult.error ||
    tasksResult.error ||
    materialCountResult.error ||
    quizAttemptCountResult.error ||
    latestQuizAttemptResult.error ||
    completedInterviewCountResult.error ||
    latestInterviewResult.error ||
    recentEventsResult.error
  ) {
    return {
      ok: false,
      error: "Could not load dashboard progress.",
    };
  }

  const goals = goalsResult.data ?? [];
  const roadmaps = roadmapsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const recentEvents = recentEventsResult.data ?? [];
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
      material_count: materialCountResult.count ?? 0,
      roadmap_count: roadmaps.length,
      roadmap_task_count: overallProgress.total,
      completed_task_count: overallProgress.completed,
      overall_progress_percentage: overallProgress.percentage,
      quiz_attempt_count: quizAttemptCountResult.count ?? 0,
      latest_quiz_score: latestQuizAttemptResult.data?.score ?? null,
      completed_interview_count: completedInterviewCountResult.count ?? 0,
      latest_interview_score: latestInterviewResult.data?.score ?? null,
      recent_events: recentEvents.map(buildProgressEventLabel),
      current_roadmap: currentRoadmap,
    },
  };
}