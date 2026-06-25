import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LoadingState } from "@/components/states/loading-state";
import { dashboardRoutes } from "@/config/routes";

export default function DashboardLoading() {
  return (
    <DashboardShell
      activePath={dashboardRoutes.dashboard}
      description="Loading your SkillForge workspace progress."
      title="Dashboard"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="brutal-card p-5" key={index}>
            <div className="mb-4 h-10 w-10 rounded-md border-2 border-black bg-paper-muted shadow-brutal-sm" />
            <div className="h-8 w-20 rounded-md border-2 border-black bg-paper-muted" />
            <div className="mt-3 h-4 w-28 rounded-md bg-zinc-200" />
          </div>
        ))}
      </section>
      <LoadingState
        description="Fetching your Day 4 goals, roadmaps, tasks, and progress totals."
        title="Loading dashboard progress..."
      />
    </DashboardShell>
  );
}
