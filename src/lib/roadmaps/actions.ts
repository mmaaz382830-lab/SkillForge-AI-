"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  AI_SAFE_MESSAGES,
  AiConfigurationError,
  AiInvalidOutputError,
  AiProviderError,
  AiUsageLimitError,
  buildRoadmapPrompt,
  generateValidatedJson,
  getSafeAiErrorMessage,
  logAiUsageEvent,
} from "@/lib/ai";
import { aiRoadmapOutputSchema, type AiRoadmapOutput } from "@/lib/ai/schemas";
import { LIMIT_REACHED_MESSAGE, assertAiUsageAllowed } from "@/lib/ai/usage";
import { logApiEvent, logErrorEvent } from "@/lib/logging/actions";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AiRoadmapGenerationInput,
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
  validateAiRoadmapGenerationInput,
  validateLearningGoalInput,
  validateRoadmapInput,
  validateRoadmapTaskInput,
  validateRoadmapTaskStatus,
} from "./validation";

const GOAL_SELECT =
  "id,user_id,title,description,category,difficulty,target_date,created_at,updated_at";
const ROADMAP_SELECT =
  "id,user_id,goal_id,material_id,title,description,difficulty,estimated_duration,ai_generated,created_at,updated_at";
const TASK_SELECT =
  "id,roadmap_id,user_id,title,description,status,order_index,estimated_time,completed_at,created_at,updated_at";

type CompletedMaterialForRoadmap = {
  id: string;
  title: string;
  extracted_text: string | null;
  processing_status: string;
  deleted_at: string | null;
};

const ROADMAP_GENERATION_VALIDATION_HINT =
  "Return title, description, difficulty, estimated_duration, and 5 to 10 ordered tasks. Each task needs order_index, title, description, and estimated_time.";

function getErrorCode(error: unknown): string {
  if (error instanceof AiInvalidOutputError) {
    return "INVALID_OUTPUT";
  }

  if (error instanceof AiConfigurationError) {
    return "AI_CONFIGURATION_UNAVAILABLE";
  }

  if (error instanceof AiProviderError) {
    return `AI_PROVIDER_${error.code.toUpperCase()}`;
  }

  return "ROADMAP_GENERATION_FAILED";
}

function buildRoadmapUsageMetadata(input: {
  materialId?: string | null;
  goalId?: string | null;
  difficulty: string;
  durationMs?: number;
  retryCount?: number;
  errorCode?: string;
}) {
  return {
    material_id: input.materialId ?? null,
    goal_id: input.goalId ?? null,
    difficulty: input.difficulty,
    duration_ms: input.durationMs ?? null,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode ?? null,
  };
}

async function logRoadmapGenerationError(input: {
  userId: string;
  materialId?: string | null;
  goalId?: string | null;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
}) {
  await logAiUsageEvent({
    userId: input.userId,
    featureType: "roadmap",
    status: "error",
    errorCode: input.errorCode,
    metadata: buildRoadmapUsageMetadata(input),
  });
}

async function logRoadmapActionSuccess(input: {
  userId: string;
  roadmapId: string;
  materialId?: string | null;
  goalId?: string | null;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  generatedItemCount: number;
}) {
  await logApiEvent({
    userId: input.userId,
    route: "generateAiRoadmap",
    method: "server_action",
    featureType: "roadmap",
    status: "success",
    durationMs: input.durationMs,
    metadata: {
      roadmap_id: input.roadmapId,
      material_id: input.materialId ?? null,
      goal_id: input.goalId ?? null,
      difficulty: input.difficulty,
      generated_item_count: input.generatedItemCount,
      retry_count: input.retryCount ?? null,
    },
  });
}

async function logRoadmapActionError(input: {
  userId: string;
  materialId?: string | null;
  goalId?: string | null;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
  safeMessage: string;
}) {
  const metadata = {
    material_id: input.materialId ?? null,
    goal_id: input.goalId ?? null,
    difficulty: input.difficulty,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode,
  };

  await logApiEvent({
    userId: input.userId,
    route: "generateAiRoadmap",
    method: "server_action",
    featureType: "roadmap",
    status: "error",
    durationMs: input.durationMs,
    metadata,
  });
  await logErrorEvent({
    userId: input.userId,
    category: "ai_generation",
    safeMessage: input.safeMessage,
    source: "generateAiRoadmap",
    featureType: "roadmap",
    severity: "error",
    metadata,
  });
}
function normalizeGeneratedRoadmapTasks(
  output: AiRoadmapOutput,
): Array<Pick<RoadmapTask, "title" | "description" | "order_index" | "estimated_time">> {
  if (output.tasks.length < 5 || output.tasks.length > 10) {
    throw new AiInvalidOutputError();
  }

  return [...output.tasks]
    .sort((first, second) => first.order_index - second.order_index)
    .map((task, index) => ({
      title: task.title,
      description: task.description,
      order_index: index + 1,
      estimated_time: task.estimated_time ?? null,
    }));
}

function buildRoadmapGoalSubject(input: {
  goal: LearningGoal | null;
  topic: string | null;
}): string | undefined {
  const parts = [
    input.goal?.title,
    input.goal?.description,
    input.topic,
  ].filter((part): part is string => Boolean(part?.trim()));

  return parts.length > 0 ? parts.join(" - ") : undefined;
}

async function loadOwnedCompletedMaterialForRoadmap(input: {
  materialId: string;
  userId: string;
}): Promise<CompletedMaterialForRoadmap | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,extracted_text,processing_status,deleted_at")
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<CompletedMaterialForRoadmap>();

  if (error || !data) {
    return null;
  }

  if (data.processing_status !== "completed" || !data.extracted_text?.trim()) {
    return null;
  }

  return data;
}

async function loadOwnedLearningGoal(input: {
  goalId: string;
  userId: string;
}): Promise<LearningGoal | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("learning_goals")
    .select(GOAL_SELECT)
    .eq("id", input.goalId)
    .eq("user_id", input.userId)
    .maybeSingle<LearningGoal>();

  if (error) {
    return null;
  }

  return data;
}

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
      material_id: null,
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

export async function generateAiRoadmap(
  input: AiRoadmapGenerationInput,
): Promise<RoadmapActionResult<Roadmap>> {
  const startedAt = Date.now();
  const user = await getAuthenticatedUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateAiRoadmapGenerationInput(input);

  if (!validation.ok) {
    return validation;
  }

  const material = validation.data.material_id
    ? await loadOwnedCompletedMaterialForRoadmap({
        materialId: validation.data.material_id,
        userId: user.data,
      })
    : null;

  if (validation.data.material_id && !material) {
    return {
      ok: false,
      error: "Select a processed material first.",
    };
  }

  const goal = validation.data.goal_id
    ? await loadOwnedLearningGoal({
        goalId: validation.data.goal_id,
        userId: user.data,
      })
    : null;

  if (validation.data.goal_id && !goal) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const usageMetadata = buildRoadmapUsageMetadata({
    materialId: validation.data.material_id,
    goalId: validation.data.goal_id,
    difficulty: validation.data.difficulty,
  });

  try {
    const rateLimit = await checkRateLimit("roadmap", {
      userId: user.data,
      route: "generateAiRoadmap",
    });

    if (!rateLimit.allowed) {
      return {
        ok: false,
        error: rateLimit.message ?? LIMIT_REACHED_MESSAGE,
      };
    }

    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "roadmap",
      route: "generateAiRoadmap",
      metadata: usageMetadata,
    });

    const prompt = buildRoadmapPrompt({
      goalTitle: buildRoadmapGoalSubject({
        goal,
        topic: validation.data.topic,
      }),
      topic: validation.data.topic ?? material?.title,
      targetDuration: validation.data.estimated_duration ?? undefined,
      difficulty: validation.data.difficulty,
      materialContext: material?.extracted_text ?? undefined,
      taskCount: validation.data.task_count ?? undefined,
    });

    const generated = await generateValidatedJson({
      prompt,
      schema: aiRoadmapOutputSchema,
      validationHint: ROADMAP_GENERATION_VALIDATION_HINT,
      temperature: 0.25,
    });
    const generatedTasks = normalizeGeneratedRoadmapTasks(generated.data);
    const supabase = await createSupabaseServerClient();
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.data,
        goal_id: validation.data.goal_id,
        material_id: validation.data.material_id,
        title: generated.data.title,
        description: generated.data.description,
        difficulty: generated.data.difficulty,
        estimated_duration: generated.data.estimated_duration,
        ai_generated: true,
      })
      .select(ROADMAP_SELECT)
      .maybeSingle<Roadmap>();

    if (roadmapError || !roadmap) {
      const errorCode = "ROADMAP_SAVE_FAILED";
      await logRoadmapGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        goalId: validation.data.goal_id,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });
      await logRoadmapActionError({
        userId: user.data,
        materialId: validation.data.material_id,
        goalId: validation.data.goal_id,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Roadmap save failed.",
      });

      return {
        ok: false,
        error: "Could not save roadmap. Please try again.",
      };
    }

    const { error: tasksError } = await supabase.from("roadmap_tasks").insert(
      generatedTasks.map((task) => ({
        roadmap_id: roadmap.id,
        user_id: user.data,
        title: task.title,
        description: task.description,
        status: "todo",
        order_index: task.order_index,
        estimated_time: task.estimated_time,
      })),
    );

    if (tasksError) {
      await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmap.id)
        .eq("user_id", user.data);

      const errorCode = "ROADMAP_TASK_SAVE_FAILED";
      await logRoadmapGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        goalId: validation.data.goal_id,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });
      await logRoadmapActionError({
        userId: user.data,
        materialId: validation.data.material_id,
        goalId: validation.data.goal_id,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
        safeMessage: "Roadmap task save failed.",
      });

      return {
        ok: false,
        error: "Could not save roadmap. Please try again.",
      };
    }

    await logAiUsageEvent({
      userId: user.data,
      featureType: "roadmap",
      status: "success",
      provider: generated.provider,
      model: generated.model,
      metadata: buildRoadmapUsageMetadata({
        materialId: validation.data.material_id,
        goalId: validation.data.goal_id,
        difficulty: generated.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
      }),
    });

    await logRoadmapActionSuccess({
      userId: user.data,
      roadmapId: roadmap.id,
      materialId: validation.data.material_id,
      goalId: validation.data.goal_id,
      difficulty: generated.data.difficulty,
      durationMs: Date.now() - startedAt,
      retryCount: generated.retryCount,
      generatedItemCount: generatedTasks.length,
    });

    revalidateRoadmapViews(roadmap.id);

    return {
      ok: true,
      data: roadmap,
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return {
        ok: false,
        error: error.safeMessage,
      };
    }

    const errorCode = getErrorCode(error);
    await logRoadmapGenerationError({
      userId: user.data,
      materialId: validation.data.material_id,
      goalId: validation.data.goal_id,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
    });

    const safeMessage =
      error instanceof AiConfigurationError
        ? AI_SAFE_MESSAGES.configurationUnavailable
        : getSafeAiErrorMessage(error);

    await logRoadmapActionError({
      userId: user.data,
      materialId: validation.data.material_id,
      goalId: validation.data.goal_id,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
      safeMessage,
    });

    if (error instanceof AiConfigurationError) {
      return {
        ok: false,
        error: safeMessage,
      };
    }

    return {
      ok: false,
      error: safeMessage,
    };
  }
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


