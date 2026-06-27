import type { Metadata } from "next";
import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ErrorState } from "@/components/states/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { DeleteMaterialButton } from "@/features/materials/components/delete-material-button";
import { MaterialPreview } from "@/features/materials/components/material-preview";
import {
  formatFileSize,
  formatMaterialDate,
  formatMaterialStatus,
  formatMaterialType,
} from "@/lib/materials/format";
import { getMaterialDetail } from "@/lib/materials/queries";
import type { MaterialDetail, MaterialProcessingStatus } from "@/types/materials";

export const metadata: Metadata = {
  title: `Material Preview | ${siteConfig.name}`,
  description: "Preview extracted private source text for one learning material.",
};

type MaterialDetailPageProps = {
  params: Promise<{
    materialId: string;
  }>;
};

const statusBadge: Record<
  MaterialProcessingStatus,
  { variant: "neutral" | "blue" | "success" | "error" }
> = {
  pending: { variant: "neutral" },
  processing: { variant: "blue" },
  completed: { variant: "success" },
  failed: { variant: "error" },
};

type MetadataItem = {
  label: string;
  value: string;
};

function buildMetadataItems(material: MaterialDetail): MetadataItem[] {
  return [
    { label: "Type", value: formatMaterialType(material.type) },
    {
      label: "Original file",
      value: material.original_file_name ?? "Pasted text entry",
    },
    {
      label: "File size",
      value: formatFileSize(material.file_size_bytes) ?? "Text entry",
    },
    { label: "MIME type", value: material.mime_type ?? "Not available" },
    {
      label: "Processing status",
      value: formatMaterialStatus(material.processing_status),
    },
    { label: "Created", value: formatMaterialDate(material.created_at) },
    { label: "Updated", value: formatMaterialDate(material.updated_at) },
  ];
}

function MaterialMetadataCard({ material }: { material: MaterialDetail }) {
  const badge = statusBadge[material.processing_status];
  const metadataItems = buildMetadataItems(material);

  return (
    <section aria-labelledby="material-metadata-heading" className="brutal-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Material detail
          </p>
          <h1
            className="mt-2 break-words font-heading text-3xl font-black leading-tight sm:text-4xl"
            id="material-metadata-heading"
          >
            {material.title}
          </h1>
        </div>
        <Badge variant={badge.variant}>
          {formatMaterialStatus(material.processing_status)}
        </Badge>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metadataItems.map((item) => (
          <div
            className="rounded-md border-2 border-black bg-paper-muted px-3 py-2 shadow-brutal-sm"
            key={item.label}
          >
            <dt className="text-xs font-black uppercase text-zinc-500">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold leading-6">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {material.processing_status === "failed" && material.processing_error ? (
        <div
          className="mt-5 rounded-lg border-2 border-black bg-accent-pink p-4 text-sm font-black leading-6 shadow-brutal-sm"
          role="status"
        >
          {material.processing_error} Re-upload a text-based PDF or TXT file to
          try again.
        </div>
      ) : null}
    </section>
  );
}

function buildChatHref(materialId: string): string {
  return `${dashboardRoutes.chat}?materialId=${encodeURIComponent(materialId)}`;
}
function FutureActions({ material }: { material: MaterialDetail }) {
  const chatReady = material.processing_status === "completed";

  return (
    <section aria-labelledby="future-material-actions-heading" className="brutal-card bg-accent-blue p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-700">
        Study actions
      </p>
      <h2
        className="mt-2 font-heading text-2xl font-black leading-tight"
        id="future-material-actions-heading"
      >
        Turn this source into study work
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {chatReady ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black leading-none shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            href={buildChatHref(material.id)}
          >
            Chat with this material
          </Link>
        ) : (
          <Button aria-disabled="true" size="sm" type="button" variant="secondary">
            Chat after processing
          </Button>
        )}
      </div>
    </section>
  );
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { materialId } = await params;
  const result = await getMaterialDetail(materialId);

  return (
    <DashboardShell
      activePath={dashboardRoutes.materials}
      description="Preview extracted text and manage one private learning material. Original storage files stay private."
      title="Material preview"
    >
      <Link
        className="inline-flex w-fit min-h-10 items-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent-blue hover:shadow-none"
        href={dashboardRoutes.materials}
      >
        Back to Materials
      </Link>

      {!result.ok ? (
        <ErrorState
          action={
            <Link
              className="inline-flex min-h-10 items-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent-blue hover:shadow-none"
              href={dashboardRoutes.materials}
            >
              Back to Materials
            </Link>
          }
          description="This material was not found, was deleted, or is not available for your account."
          title="Material unavailable."
        />
      ) : (
        <div className="grid gap-5">
          <MaterialMetadataCard material={result.data} />
          <MaterialPreview material={result.data} />
          <FutureActions material={result.data} />
          <section aria-labelledby="delete-material-heading" className="brutal-card p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
              Library management
            </p>
            <h2
              className="mt-2 font-heading text-2xl font-black leading-tight"
              id="delete-material-heading"
            >
              Delete material
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-700">
              This hides the material from normal views. Private file preview or
              download is not part of this prompt.
            </p>
            <div className="mt-4">
              <DeleteMaterialButton
                materialId={result.data.id}
                materialTitle={result.data.title}
                redirectAfterDelete
              />
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
