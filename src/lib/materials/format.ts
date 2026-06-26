import type { MaterialProcessingStatus, MaterialType } from "@/types/materials";

export function formatMaterialType(type: MaterialType): string {
  const labels: Record<MaterialType, string> = {
    pdf: "PDF",
    txt: "TXT",
    pasted_text: "Pasted text",
  };

  return labels[type];
}

export function formatMaterialStatus(status: MaterialProcessingStatus): string {
  const labels: Record<MaterialProcessingStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
  };

  return labels[status];
}

export function formatFileSize(bytes: number | null): string | null {
  if (bytes === null) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMaterialDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}