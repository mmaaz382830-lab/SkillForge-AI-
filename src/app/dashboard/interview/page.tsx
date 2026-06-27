import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { InterviewSection } from "@/features/interview/components/interview-section";
import { listCompletedMaterialRoadmapOptions } from "@/lib/materials/queries";
import { listInterviewSessionViews } from "@/lib/interviews/queries";

export const metadata: Metadata = {
  title: `Mock Interview — ${siteConfig.name}`,
  description:
    "Practice technical interview questions generated from your own uploaded notes.",
};

/**
 * /dashboard/interview — AI interview question generation, session list, and preview.
 * No answer submission, scoring, or feedback engine (Day 9+).
 */
export default async function InterviewPage() {
  const [sessionsResult, materialsResult] = await Promise.all([
    listInterviewSessionViews(),
    listCompletedMaterialRoadmapOptions(),
  ]);

  return (
    <DashboardShell
      activePath={dashboardRoutes.interview}
      description="Generate technical interview questions from your own material. Practice clear explanations."
      title="Mock Interview"
    >
      {!sessionsResult.ok ? (
        <ErrorState
          description="Please refresh the page or sign in again before generating interview questions."
          title="Could not load interview sessions."
        />
      ) : (
        <InterviewSection
          sessions={sessionsResult.data}
          materials={materialsResult.ok ? materialsResult.data : []}
        />
      )}
    </DashboardShell>
  );
}
