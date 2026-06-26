import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Badge } from "@/components/ui/badge";
import type { MaterialDetail } from "@/types/materials";

type MaterialPreviewProps = {
  material: MaterialDetail;
};

export function MaterialPreview({ material }: MaterialPreviewProps) {
  if (material.processing_status === "failed") {
    return (
      <ErrorState
        description={
          material.processing_error ??
          "This material could not be processed. Re-upload a text-based PDF or TXT file."
        }
        title="Processing failed."
      />
    );
  }

  if (material.processing_status === "pending") {
    return (
      <EmptyState
        accent="blue"
        description="This material is queued. Refresh after processing finishes to preview extracted text."
        title="Preview is not ready yet."
      />
    );
  }

  if (material.processing_status === "processing") {
    return (
      <EmptyState
        accent="blue"
        description="SkillForge is preparing extracted text for this material."
        title="Material is still processing."
      />
    );
  }

  const extractedText = material.extracted_text?.trim();

  if (!extractedText) {
    return (
      <EmptyState
        accent="blue"
        description="No readable text was saved for this material. Re-upload as TXT or paste the notes if the source was scanned or image-based."
        title="No extracted text available."
      />
    );
  }

  return (
    <section aria-labelledby="material-preview-heading" className="brutal-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-600">
            Extracted text preview
          </p>
          <h2
            className="mt-2 font-heading text-2xl font-black leading-tight"
            id="material-preview-heading"
          >
            Readable source text
          </h2>
        </div>
        <Badge variant="blue">Private preview</Badge>
      </div>
      <div className="mt-5 max-h-[36rem] overflow-auto rounded-lg border-2 border-black bg-paper-muted p-4 shadow-brutal-sm">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm font-medium leading-7 text-ink-text sm:text-base">
          {extractedText}
        </pre>
      </div>
    </section>
  );
}
