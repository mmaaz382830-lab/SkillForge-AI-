import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { dashboardRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MaterialCard } from "@/features/materials/components/material-card";
import { MaterialsUploadSection } from "@/features/materials/components/materials-upload-section";
import { listMaterials } from "@/lib/materials/queries";

export const metadata: Metadata = {
  title: `Materials — ${siteConfig.name}`,
  description:
    "Upload and manage your learning materials. PDFs, TXT files, and pasted text.",
};

export default async function MaterialsPage() {
  const materialsResult = await listMaterials();

  return (
    <DashboardShell
      activePath={dashboardRoutes.materials}
      description="Upload PDF/TXT files or paste notes. Each processed material becomes a private source for future study tools."
      title="Materials"
    >
      <MaterialsUploadSection />

      <section aria-labelledby="materials-list-heading" className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">
            Private source library
          </p>
          <h2
            className="mt-1 font-heading text-2xl font-black"
            id="materials-list-heading"
          >
            Your materials
          </h2>
        </div>

        {!materialsResult.ok ? (
          <ErrorState
            description="Refresh the page or sign in again before uploading more materials."
            title="Could not load materials."
          />
        ) : materialsResult.data.length === 0 ? (
          <EmptyState
            accent="blue"
            description="Upload a PDF/TXT or paste notes to start building your study system."
            title="No materials yet"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {materialsResult.data.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}