import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardRoutes } from "@/config/routes";

export default function MaterialDetailLoading() {
  return (
    <DashboardShell
      activePath={dashboardRoutes.materials}
      description="Loading this material preview."
      title="Material preview"
    >
      <section aria-busy="true" aria-live="polite" className="grid gap-5">
        <div className="brutal-card bg-accent-blue p-5 sm:p-6">
          <Skeleton className="h-5 w-36 bg-paper-base" />
          <Skeleton className="mt-4 h-10 w-full max-w-xl bg-paper-base" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-20 bg-paper-base" />
            <Skeleton className="h-20 bg-paper-base" />
            <Skeleton className="h-20 bg-paper-base" />
          </div>
        </div>
        <div className="brutal-card p-5 sm:p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-5 h-80 w-full" />
        </div>
      </section>
    </DashboardShell>
  );
}
