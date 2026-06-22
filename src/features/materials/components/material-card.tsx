import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type MaterialStatus = "pending" | "processing" | "completed" | "failed";

type MaterialCardProps = {
  title: string;
  fileType: string;
  uploadDate: string;
  status: MaterialStatus;
  chunkCount?: number;
};

const statusBadge: Record<MaterialStatus, { variant: "neutral" | "blue" | "success" | "error"; label: string }> = {
  pending: { variant: "neutral", label: "Pending" },
  processing: { variant: "blue", label: "Processing" },
  completed: { variant: "success", label: "Completed" },
  failed: { variant: "error", label: "Failed" },
};

const fileTypeColors: Record<string, string> = {
  PDF: "bg-accent-blue",
  TXT: "bg-accent-green",
  Text: "bg-accent-yellow",
};

/**
 * MaterialCard — visual-only material file card.
 * Shows title, type, date, status. No real actions.
 */
export function MaterialCard({
  title,
  fileType,
  uploadDate,
  status,
  chunkCount,
}: MaterialCardProps) {
  const badge = statusBadge[status];

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
            {title}
          </h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            Uploaded {uploadDate}
            {chunkCount ? ` · ${chunkCount} chunks` : ""}
          </p>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-paper-base px-3 py-1.5 text-xs font-black shadow-brutal-sm"
        >
          Preview
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-accent-blue px-3 py-1.5 text-xs font-black shadow-brutal-sm"
        >
          Chat
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="pressable rounded-md border-2 border-black bg-accent-yellow px-3 py-1.5 text-xs font-black shadow-brutal-sm"
        >
          Generate
        </button>
      </div>
    </article>
  );
}
