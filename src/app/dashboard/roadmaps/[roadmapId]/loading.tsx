import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardRoutes } from "@/config/routes";

export default function RoadmapDetailLoading() {
  return (
    <DashboardShell
      activePath={dashboardRoutes.roadmaps}
      description="Loading the checklist for this roadmap."
      title="Roadmap detail"
    >
      <section aria-busy="true" aria-live="polite" className="grid gap-5">
        <div className="brutal-card bg-accent-yellow p-5 sm:p-6">
          <Skeleton className="h-5 w-32 bg-paper-base" />
          <Skeleton className="mt-4 h-10 w-full max-w-xl bg-paper-base" />
          <Skeleton className="mt-3 h-20 w-full bg-paper-base" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="brutal-card p-5 sm:p-6">
          <Skeleton className="h-8 w-56" />
          <div className="mt-5 grid gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
