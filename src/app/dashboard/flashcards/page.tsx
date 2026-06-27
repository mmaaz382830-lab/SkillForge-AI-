import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { FlashcardsSection } from "@/features/flashcards/components/flashcards-section";
import { listFlashcardDeckViews } from "@/lib/flashcards/queries";
import { listCompletedMaterialRoadmapOptions } from "@/lib/materials/queries";

export const metadata: Metadata = {
  title: `Flashcards - ${siteConfig.name}`,
  description: "Study with AI-generated flashcard decks from your uploaded materials.",
};

export default async function FlashcardsPage() {
  const [decksResult, materialsResult] = await Promise.all([
    listFlashcardDeckViews(),
    listCompletedMaterialRoadmapOptions(),
  ]);

  return (
    <DashboardShell
      activePath={dashboardRoutes.flashcards}
      description="Revise your material with physical study cards generated from your notes."
      title="Flashcards"
    >
      {!decksResult.ok ? (
        <ErrorState
          description="Please refresh the page or sign in again before generating flashcards."
          title="Could not load flashcards."
        />
      ) : (
        <FlashcardsSection
          decks={decksResult.data}
          materials={materialsResult.ok ? materialsResult.data : []}
        />
      )}
    </DashboardShell>
  );
}
