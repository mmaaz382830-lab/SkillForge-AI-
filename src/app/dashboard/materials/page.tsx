import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { dashboardRoutes } from "@/config/routes";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { MaterialCard } from "@/features/materials/components/material-card";

export const metadata: Metadata = {
  title: `Materials — ${siteConfig.name}`,
  description: "Upload and manage your learning materials. PDFs, TXT files, and pasted text.",
};

const STATIC_MATERIALS = [
  {
    title: "JavaScript Notes.pdf",
    fileType: "PDF",
    uploadDate: "Today",
    status: "completed" as const,
    chunkCount: 42,
  },
  {
    title: "React Hooks — Personal Notes",
    fileType: "Text",
    uploadDate: "Yesterday",
    status: "processing" as const,
  },
  {
    title: "Async Await Patterns.txt",
    fileType: "TXT",
    uploadDate: "3 days ago",
    status: "pending" as const,
  },
  {
    title: "Node.js Module System.pdf",
    fileType: "PDF",
    uploadDate: "Last week",
    status: "failed" as const,
  },
];

/**
 * /dashboard/materials — Materials visual shell.
 * Static data only. No real upload, no Supabase storage, no file processing.
 */
export default function MaterialsPage() {
  return (
    <DashboardShell
      title="Materials"
      description="Your uploaded notes, PDFs, and text. Each material becomes a source for AI study tools."
      activePath={dashboardRoutes.materials}
      actions={
        <Button type="button" variant="primary" size="sm" aria-disabled="true">
          Upload material
        </Button>
      }
    >
      {/* Upload dropzone visual */}
      <section
        className="rounded-xl border-4 border-dashed border-black bg-paper-base p-8 text-center shadow-brutal-sm"
        aria-label="Upload area"
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md border-2 border-black bg-accent-blue text-2xl shadow-brutal-sm"
          aria-hidden="true"
        >
          📄
        </div>
        <h2 className="font-heading text-2xl font-black">
          Drop your PDF or TXT here, or browse files.
        </h2>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          PDF and TXT supported for MVP. Scanned PDFs may not extract correctly
          yet. Max 10 MB.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["PDF", "TXT", "Pasted Text"].map((type) => (
            <span
              key={type}
              className="rounded-pill border-2 border-black bg-accent-blue px-3 py-1 text-xs font-black shadow-brutal-sm"
            >
              {type}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="primary" aria-disabled="true">
            Browse files
          </Button>
          <Button type="button" variant="secondary" aria-disabled="true">
            Paste text
          </Button>
        </div>
        <p className="mt-4 text-xs font-semibold text-zinc-400">
          Upload your first material to start building your learning system.
        </p>
      </section>

      {/* Material list */}
      <section aria-label="Your materials">
        <h2 className="mb-4 font-heading text-xl font-black">
          Your materials
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STATIC_MATERIALS.map((mat) => (
            <MaterialCard key={mat.title} {...mat} />
          ))}
        </div>
      </section>

      {/* Empty state example */}
      <EmptyState
        title="No materials yet."
        description="Upload your first note, PDF, or paste text to start building your AI learning system."
        accent="blue"
        action={
          <Button type="button" variant="primary" aria-disabled="true">
            Upload first material
          </Button>
        }
      />
    </DashboardShell>
  );
}
