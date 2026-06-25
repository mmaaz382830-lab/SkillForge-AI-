import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LoadingState } from "@/components/states/loading-state";
import { dashboardRoutes } from "@/config/routes";

export default function RoadmapsLoading() {
  return (
    <DashboardShell
      activePath={dashboardRoutes.roadmaps}
      description="Loading your learning goals."
      title="Learning Roadmaps"
    >
      <LoadingState
        description="Fetching your saved goals before roadmap work starts."
        title="Loading learning goals..."
      />
    </DashboardShell>
  );
}
