import type {
  MaterialProcessingErrorCode,
  MaterialType,
} from "@/types/materials";

export const MATERIAL_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MATERIAL_MAX_FILE_SIZE_LABEL = "5 MB";
export const MATERIAL_MAX_TITLE_LENGTH = 120;
export const MATERIAL_MAX_PASTED_TEXT_LENGTH = 500_000;

export const MATERIAL_ALLOWED_FILE_TYPES: Record<
  Exclude<MaterialType, "pasted_text">,
  {
    extension: ".pdf" | ".txt";
    mimeType: "application/pdf" | "text/plain";
  }
> = {
  pdf: {
    extension: ".pdf",
    mimeType: "application/pdf",
  },
  txt: {
    extension: ".txt",
    mimeType: "text/plain",
  },
};

export const MATERIAL_SAFE_ERROR_MESSAGES: Record<
  MaterialProcessingErrorCode,
  string
> = {
  unsupported_file_type: "Unsupported file type. Upload a PDF or TXT file.",
  file_too_large: "File is too large. Maximum size is 5 MB.",
  file_empty: "File is empty.",
  missing_title: "Material title is required.",
  missing_text: "Pasted text is required.",
  extraction_empty: "Text could not be extracted from this file.",
  pdf_unreadable:
    "This PDF may be scanned, password-protected, or corrupted.",
  processing_failed: "Could not process this material. Please try again.",
};
