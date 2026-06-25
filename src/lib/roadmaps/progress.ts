import type { RoadmapProgress, RoadmapTask } from "@/types/roadmaps";

export function calculateRoadmapProgress(
  tasks: Pick<RoadmapTask, "status">[],
): RoadmapProgress {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}
