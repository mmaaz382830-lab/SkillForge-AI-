import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { RagChatSection } from "@/features/rag-chat/components";
import { listMaterials } from "@/lib/materials/queries";
import { listChatSessions } from "@/lib/rag/queries";

export const metadata: Metadata = {
  title: `Chat with Notes - ${siteConfig.name}`,
  description:
    "Ask questions from your own notes and get answers grounded in your material.",
};

type RagChatPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function getFirstSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function RagChatPage({ searchParams }: RagChatPageProps) {
  const [materialsResult, sessionsResult, resolvedSearchParams] =
    await Promise.all([listMaterials(), listChatSessions(), searchParams]);

  const requestedMaterialId = getFirstSearchParam(
    resolvedSearchParams.materialId,
  );
  const completedMaterials = materialsResult.ok
    ? materialsResult.data
        .filter((material) => material.processing_status === "completed")
        .map((material) => ({
          id: material.id,
          title: material.title,
          type: material.type,
          chunk_count: material.chunk_count,
          created_at: material.created_at,
        }))
    : [];
  const initialMaterialId = completedMaterials.some(
    (material) => material.id === requestedMaterialId,
  )
    ? requestedMaterialId
    : null;
  const initialNotice =
    requestedMaterialId && !initialMaterialId
      ? "That material is not available for chat. Select a completed material to continue."
      : null;

  return (
    <DashboardShell
      activePath={dashboardRoutes.chat}
      description="Chat with your own notes and get answers that come straight from your material."
      title="Chat with your notes"
    >
      {!materialsResult.ok ? (
        <ErrorState
          description="Refresh the page or sign in again before starting a note chat."
          title="Could not load materials."
        />
      ) : !sessionsResult.ok ? (
        <ErrorState
          description="Refresh the page or sign in again before opening saved chats."
          title="Could not load chat sessions."
        />
      ) : (
        <RagChatSection
          initialMaterialId={initialMaterialId}
          initialNotice={initialNotice}
          materials={completedMaterials}
          sessions={sessionsResult.data}
        />
      )}
    </DashboardShell>
  );
}