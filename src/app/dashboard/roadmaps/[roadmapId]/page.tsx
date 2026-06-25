import type { Metadata } from "next";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { RoadmapDetail } from "@/features/roadmaps/components/roadmap-detail";
import { getRoadmapById } from "@/lib/roadmaps/queries";

export const metadata: Metadata = {
  title: `Roadmap Tasks — ${siteConfig.name}`,
  description: "Manage ordered roadmap tasks and learning progress.",
};

type RoadmapDetailPageProps = {
  params: Promise<{
    roadmapId: string;
  }>;
};

export default async function RoadmapDetailPage({
  params,
}: RoadmapDetailPageProps) {
  const { roadmapId } = await params;
  const result = await getRoadmapById(roadmapId);

  return (
    <DashboardShell
      activePath={dashboardRoutes.roadmaps}
      description="Manage the checklist, task status, and progress for one roadmap."
      title="Roadmap detail"
    >
      {!result.ok ? (
        <ErrorState
          action={
            <Link
              className="inline-flex min-h-10 items-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent-yellow hover:shadow-none"
              href={dashboardRoutes.roadmaps}
            >
              Back to roadmaps
            </Link>
          }
          description={
            result.error === "You do not have access to this item."
              ? "Roadmap not found or you do not have access."
              : "Could not load this roadmap."
          }
          title={
            result.error === "You do not have access to this item."
              ? "Roadmap unavailable."
              : "Could not load this roadmap."
          }
        />
      ) : (
        <RoadmapDetail roadmap={result.data} />
      )}
    </DashboardShell>
  );
}



