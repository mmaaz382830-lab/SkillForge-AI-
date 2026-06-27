export type MaterialType = "pdf" | "txt" | "pasted_text";

export type MaterialProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type MaterialRow = {
  id: string;
  user_id: string;
  title: string;
  type: MaterialType;
  storage_path: string | null;
  original_file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  extracted_text: string | null;
  processing_status: MaterialProcessingStatus;
  processing_error: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type MaterialListItem = Omit<
  MaterialRow,
  "user_id" | "extracted_text" | "storage_path"
>;

export type MaterialRoadmapOption = Pick<MaterialRow, "id" | "title">;

export type MaterialDetail = Omit<MaterialRow, "user_id">;

export type CreatePastedTextMaterialInput = {
  title: string;
  text: string;
};

export type UploadMaterialInput = {
  title: string;
  file: File;
};

export type ValidatedMaterialTitle = {
  title: string;
};

export type ValidatedPastedTextMaterial = {
  title: string;
  text: string;
  type: "pasted_text";
};

export type ValidatedMaterialFile = {
  file: File;
  type: Exclude<MaterialType, "pasted_text">;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: ".pdf" | ".txt";
};

export type ExtractedMaterialText = {
  text: string;
  type: Exclude<MaterialType, "pasted_text">;
};

export type MaterialProcessingErrorCode =
  | "unsupported_file_type"
  | "file_too_large"
  | "file_empty"
  | "missing_title"
  | "missing_text"
  | "extraction_empty"
  | "pdf_unreadable"
  | "processing_failed";

export type MaterialActionResult<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      code?: MaterialProcessingErrorCode;
    };
