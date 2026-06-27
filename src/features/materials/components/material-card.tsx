import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/config/routes";
import {
  formatFileSize,
  formatMaterialDate,
  formatMaterialStatus,
  formatMaterialType,
} from "@/lib/materials/format";
import { cn } from "@/lib/utils/cn";
import type {
  MaterialListItem,
  MaterialProcessingStatus,
} from "@/types/materials";

import { DeleteMaterialButton } from "./delete-material-button";

type MaterialCardProps = {
  material: MaterialListItem;
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

const fileTypeColors: Record<string, string> = {
  PDF: "bg-accent-blue",
  TXT: "bg-accent-green",
  "Pasted text": "bg-accent-yellow",
};

function buildChatHref(materialId: string): string {
  return `${dashboardRoutes.chat}?materialId=${encodeURIComponent(materialId)}`;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const fileType = formatMaterialType(material.type);
  const badge = statusBadge[material.processing_status];
  const fileSize = formatFileSize(material.file_size_bytes);
  const chatReady = material.processing_status === "completed";

  return (
    <article className="brutal-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-black text-xs font-black shadow-brutal-sm",
            fileTypeColors[fileType] ?? "bg-paper-muted",
          )}
          aria-hidden="true"
        >
          {fileType}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-black leading-tight">
            {material.title}
          </h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            Added {formatMaterialDate(material.created_at)}
          </p>
        </div>
        <Badge variant={badge.variant}>
          {formatMaterialStatus(material.processing_status)}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-2 text-sm font-semibold sm:grid-cols-2">
        <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
          <dt className="text-xs font-black uppercase text-zinc-500">Source</dt>
          <dd className="truncate">
            {material.original_file_name ?? formatMaterialType(material.type)}
          </dd>
        </div>
        <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-2">
          <dt className="text-xs font-black uppercase text-zinc-500">Size</dt>
          <dd>{fileSize ?? "Text entry"}</dd>
        </div>
      </dl>

      {material.processing_status === "failed" && material.processing_error ? (
        <p
          className="mt-4 rounded-md border-2 border-black bg-accent-pink px-3 py-2 text-sm font-black leading-6"
          role="status"
        >
          {material.processing_error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-start gap-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border-2 border-black bg-paper-base px-3 py-2 text-sm font-black leading-none shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          href={dashboardRoutes.materialDetail(material.id)}
        >
          Preview
        </Link>
        {chatReady ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border-2 border-black bg-accent-blue px-3 py-2 text-sm font-black leading-none shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            href={buildChatHref(material.id)}
          >
            Chat with this material
          </Link>
        ) : (
          <Button aria-disabled="true" size="sm" type="button" variant="secondary">
            Chat after processing
          </Button>
        )}
        <Button aria-disabled="true" size="sm" type="button" variant="highlight">
          Generate Day 6
        </Button>
        <DeleteMaterialButton
          materialId={material.id}
          materialTitle={material.title}
          size="sm"
        />
      </div>
    </article>
  );
}
