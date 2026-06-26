import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { dashboardRoutes } from "@/config/routes";
import {
  formatMaterialDate,
  formatMaterialStatus,
  formatMaterialType,
} from "@/lib/materials/format";
import type { MaterialListItem, MaterialProcessingStatus } from "@/types/materials";

type RecentActivityCardProps = {
  loadError?: boolean;
  materials: MaterialListItem[];
};

const statusBadge: Record<
  MaterialProcessingStatus,
  "neutral" | "blue" | "success" | "error"
> = {
  pending: "neutral",
  processing: "blue",
  completed: "success",
  failed: "error",
};

export function RecentActivityCard({
  loadError = false,
  materials,
}: RecentActivityCardProps) {
  return (
    <section className="brutal-card p-5 sm:p-6" aria-label="Recent materials">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Source library
          </p>
          <h2 className="mt-2 font-heading text-xl font-black">
            Recent materials
          </h2>
        </div>
        <Link
          className="inline-flex w-fit min-h-9 items-center rounded-md border-2 border-black bg-accent-blue px-3 py-2 text-xs font-black uppercase shadow-brutal-sm transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          href={dashboardRoutes.materials}
        >
          View all
        </Link>
      </div>

      {loadError ? (
        <div className="rounded-md border-2 border-black bg-accent-pink px-3 py-3 text-sm font-black leading-6">
          Could not load recent materials. Open Materials to refresh your library.
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-md border-2 border-black bg-paper-muted px-3 py-3 text-sm font-semibold leading-6">
          Upload your first PDF, TXT, or pasted note to see recent materials here.
        </div>
      ) : (
        <ol className="grid gap-3" role="list">
          {materials.map((material) => (
            <li key={material.id}>
              <Link
                className="flex items-start justify-between gap-3 rounded-md border-2 border-black bg-paper-muted px-3 py-2 no-underline transition hover:-translate-y-0.5 hover:bg-accent-blue hover:shadow-brutal-sm"
                href={dashboardRoutes.materialDetail(material.id)}
              >
                <div className="min-w-0">
                  <span className="block truncate text-sm font-black leading-tight">
                    {material.title}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-zinc-600">
                    {formatMaterialType(material.type)} - Added {formatMaterialDate(material.created_at)}
                  </span>
                </div>
                <Badge variant={statusBadge[material.processing_status]}>
                  {formatMaterialStatus(material.processing_status)}
                </Badge>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
