"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  LearningGoal,
  LearningGoalInput,
  ProgressEvent,
  Roadmap,
  RoadmapActionResult,
  RoadmapInput,
  RoadmapTask,
  RoadmapTaskInput,
  RoadmapTaskStatus,
} from "@/types/roadmaps";

import {
  getAuthenticatedUserId,
  getOwnedTask,
  verifyLearningGoalOwnership,
  verifyRoadmapOwnership,
} from "./queries";
import {
  validateLearningGoalInput,
  validateRoadmapInput,
  validateRoadmapTaskInput,
  validateRoadmapTaskStatus,
} from "./validation";

const GOAL_SELECT =
  "id,user_id,title,description,category,difficulty,target_date,created_at,updated_at";
const ROADMAP_SELECT =
  "id,user_id,goal_id,title,description,difficulty,estimated_duration,ai_generated,created_at,updated_at";
const TASK_SELECT =
  "id,roadmap_id,user_id,title,description,status,order_index,estimated_time,completed_at,created_at,updated_at";

function revalidateRoadmapViews(roadmapId?: string) {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.roadmaps);
  revalidatePath(dashboardRoutes.progress);

  if (roadmapId) {
    revalidatePath(`${dashboardRoutes.roadmaps}/${roadmapId}`);
  }
}

async function recordProgressEvent(input: {
  userId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<RoadmapActionResult<ProgressEvent | null>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("progress_events")
    .insert({
      user_id: input.userId,
      event_type: input.eventType,
      entity_type: input.entityType,
      entity_id: input.entityId,
      metadata: input.metadata ?? {},
    })
    .select("id,user_id,event_type,entity_type,entity_id,metadata,created_at")
    .maybeSingle<ProgressEvent>();

  if (error) {
    return {
      ok: false,
      error: "Could not record progress.",
    };
  }

  return {
    ok: true,
    data: data ?? null,
  };
}

export async function createLearningGoal(
  input: LearningGoalInput,
): Promise<RoadmapActionResult<LearningGoal>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateLearningGoalInput(input);

  if (!validation.ok) {
    return validation;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .insert({
      ...validation.data,
      user_id: user.data,
    })
    .select(GOAL_SELECT)
    .maybeSingle<LearningGoal>();

  if (error || !data) {
    return {
      ok: false,
      error: "Could not save goal.",
    };
  }

  revalidateRoadmapViews();

  return {
    ok: true,
    data,
  };
}

export async function updateLearningGoal(
  id: string,
  input: LearningGoalInput,
): Promise<RoadmapActionResult<LearningGoal>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateLearningGoalInput(input);

  if (!validation.ok) {
    return validation;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .update(validation.data)
    .eq("id", id)
    .eq("user_id", user.data)
    .select(GOAL_SELECT)
    .maybeSingle<LearningGoal>();

  if (error) {
    return {
      ok: false,
      error: "Could not update goal.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  revalidateRoadmapViews();

  return {
    ok: true,
    data,
  };
}

export async function deleteLearningGoal(
  id: string,
): Promise<RoadmapActionResult<{ id: string }>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("learning_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.data);

  if (error) {
    return {
      ok: false,
      error: "Could not delete goal.",
    };
  }

  revalidateRoadmapViews();

  return {
    ok: true,
    data: { id },
  };
}

export async function createRoadmap(
  input: RoadmapInput,
): Promise<RoadmapActionResult<Roadmap>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateRoadmapInput(input);

  if (!validation.ok) {
    return validation;
  }

  if (
    validation.data.goal_id &&
    !(await verifyLearningGoalOwnership(validation.data.goal_id, user.data))
  ) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .insert({
      ...validation.data,
      ai_generated: false,
      user_id: user.data,
    })
    .select(ROADMAP_SELECT)
    .maybeSingle<Roadmap>();

  if (error || !data) {
    return {
      ok: false,
      error: "Could not save roadmap.",
    };
  }

  revalidateRoadmapViews();

  return {
    ok: true,
    data,
  };
}

export async function updateRoadmap(
  id: string,
  input: RoadmapInput,
): Promise<RoadmapActionResult<Roadmap>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateRoadmapInput(input);

  if (!validation.ok) {
    return validation;
  }

  if (
    validation.data.goal_id &&
    !(await verifyLearningGoalOwnership(validation.data.goal_id, user.data))
  ) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .update({
      ...validation.data,
      ai_generated: false,
    })
    .eq("id", id)
    .eq("user_id", user.data)
    .select(ROADMAP_SELECT)
    .maybeSingle<Roadmap>();

  if (error) {
    return {
      ok: false,
      error: "Could not update roadmap.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  revalidateRoadmapViews(id);

  return {
    ok: true,
    data,
  };
}

export async function deleteRoadmap(
  id: string,
): Promise<RoadmapActionResult<{ id: string }>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("roadmaps")
    .delete()
    .eq("id", id)
    .eq("user_id", user.data);

  if (error) {
    return {
      ok: false,
      error: "Could not delete roadmap.",
    };
  }

  revalidateRoadmapViews(id);

  return {
    ok: true,
    data: { id },
  };
}

export async function createRoadmapTask(
  roadmapId: string,
  input: RoadmapTaskInput,
): Promise<RoadmapActionResult<RoadmapTask>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateRoadmapTaskInput(input);

  if (!validation.ok) {
    return validation;
  }

  if (!(await verifyRoadmapOwnership(roadmapId, user.data))) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const completedAt =
    validation.data.status === "completed" ? new Date().toISOString() : null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmap_tasks")
    .insert({
      ...validation.data,
      completed_at: completedAt,
      roadmap_id: roadmapId,
      user_id: user.data,
    })
    .select(TASK_SELECT)
    .maybeSingle<RoadmapTask>();

  if (error || !data) {
    return {
      ok: false,
      error: "Could not save task.",
    };
  }

  if (data.status === "completed") {
    await recordProgressEvent({
      userId: user.data,
      eventType: "task_completed",
      entityType: "roadmap_task",
      entityId: data.id,
      metadata: {
        roadmap_id: roadmapId,
        task_title: data.title,
      },
    });
  }

  revalidateRoadmapViews(roadmapId);

  return {
    ok: true,
    data,
  };
}

export async function updateRoadmapTask(
  taskId: string,
  input: RoadmapTaskInput,
): Promise<RoadmapActionResult<RoadmapTask>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const existingTask = await getOwnedTask(taskId, user.data);

  if (
    !existingTask ||
    !(await verifyRoadmapOwnership(existingTask.roadmap_id, user.data))
  ) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const validation = validateRoadmapTaskInput(input);

  if (!validation.ok) {
    return validation;
  }

  const completedAt =
    validation.data.status === "completed"
      ? (existingTask.completed_at ?? new Date().toISOString())
      : null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmap_tasks")
    .update({
      ...validation.data,
      completed_at: completedAt,
    })
    .eq("id", taskId)
    .eq("user_id", user.data)
    .select(TASK_SELECT)
    .maybeSingle<RoadmapTask>();

  if (error) {
    return {
      ok: false,
      error: "Could not update task.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  if (existingTask.status !== "completed" && data.status === "completed") {
    await recordProgressEvent({
      userId: user.data,
      eventType: "task_completed",
      entityType: "roadmap_task",
      entityId: data.id,
      metadata: {
        roadmap_id: data.roadmap_id,
        task_title: data.title,
      },
    });
  }

  revalidateRoadmapViews(data.roadmap_id);

  return {
    ok: true,
    data,
  };
}

export async function deleteRoadmapTask(
  taskId: string,
): Promise<RoadmapActionResult<{ id: string }>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const existingTask = await getOwnedTask(taskId, user.data);

  if (
    !existingTask ||
    !(await verifyRoadmapOwnership(existingTask.roadmap_id, user.data))
  ) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("roadmap_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.data);

  if (error) {
    return {
      ok: false,
      error: "Could not delete task.",
    };
  }

  revalidateRoadmapViews(existingTask.roadmap_id);

  return {
    ok: true,
    data: { id: taskId },
  };
}

export async function updateRoadmapTaskStatus(
  taskId: string,
  status: RoadmapTaskStatus,
): Promise<RoadmapActionResult<RoadmapTask>> {
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateRoadmapTaskStatus(status);

  if (!validation.ok) {
    return validation;
  }

  const existingTask = await getOwnedTask(taskId, user.data);

  if (
    !existingTask ||
    !(await verifyRoadmapOwnership(existingTask.roadmap_id, user.data))
  ) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const completedAt =
    validation.data === "completed" ? new Date().toISOString() : null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("roadmap_tasks")
    .update({
      status: validation.data,
      completed_at: completedAt,
    })
    .eq("id", taskId)
    .eq("user_id", user.data)
    .select(TASK_SELECT)
    .maybeSingle<RoadmapTask>();

  if (error) {
    return {
      ok: false,
      error: "Could not update task.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  if (existingTask.status !== "completed" && data.status === "completed") {
    await recordProgressEvent({
      userId: user.data,
      eventType: "task_completed",
      entityType: "roadmap_task",
      entityId: data.id,
      metadata: {
        roadmap_id: data.roadmap_id,
        task_title: data.title,
      },
    });
  }

  revalidateRoadmapViews(data.roadmap_id);

  return {
    ok: true,
    data,
  };
}


