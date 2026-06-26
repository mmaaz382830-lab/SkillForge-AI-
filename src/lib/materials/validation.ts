import type {
  CreatePastedTextMaterialInput,
  MaterialActionResult,
  MaterialProcessingErrorCode,
  ValidatedMaterialFile,
  ValidatedPastedTextMaterial,
} from "@/types/materials";

import {
  MATERIAL_ALLOWED_FILE_TYPES,
  MATERIAL_MAX_FILE_SIZE_BYTES,
  MATERIAL_MAX_PASTED_TEXT_LENGTH,
  MATERIAL_MAX_TITLE_LENGTH,
  MATERIAL_SAFE_ERROR_MESSAGES,
} from "./constants";
import { getFileExtension } from "./file-utils";

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function getSafeProcessingError(
  error: unknown,
): Extract<MaterialActionResult<never>, { ok: false }> {
  if (error instanceof MaterialProcessingError) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES[error.code],
      code: error.code,
    };
  }

  return {
    ok: false,
    error: MATERIAL_SAFE_ERROR_MESSAGES.processing_failed,
    code: "processing_failed",
  };
}

export class MaterialProcessingError extends Error {
  constructor(readonly code: MaterialProcessingErrorCode) {
    super(MATERIAL_SAFE_ERROR_MESSAGES[code]);
    this.name = "MaterialProcessingError";
  }
}

export function validateMaterialTitle(
  value: string,
): MaterialActionResult<string> {
  const title = value.trim();

  if (!title) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.missing_title,
      code: "missing_title",
    };
  }

  if (title.length > MATERIAL_MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be ${MATERIAL_MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    data: title,
  };
}

export function validateExtractedText(
  text: string,
): MaterialActionResult<string> {
  const normalized = normalizeExtractedText(text);

  if (!normalized) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.extraction_empty,
      code: "extraction_empty",
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

export function validatePastedTextMaterial(
  input: CreatePastedTextMaterialInput,
): MaterialActionResult<ValidatedPastedTextMaterial> {
  const title = validateMaterialTitle(input.title);

  if (!title.ok) {
    return title;
  }

  const text = validateExtractedText(input.text);

  if (!text.ok) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.missing_text,
      code: "missing_text",
    };
  }

  if (text.data.length > MATERIAL_MAX_PASTED_TEXT_LENGTH) {
    return {
      ok: false,
      error: "Pasted text is too long. Please upload a TXT file instead.",
    };
  }

  return {
    ok: true,
    data: {
      title: title.data,
      text: text.data,
      type: "pasted_text",
    },
  };
}

export function validateMaterialFile(
  file: File | null | undefined,
): MaterialActionResult<ValidatedMaterialFile> {
  if (!file) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.processing_failed,
      code: "processing_failed",
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.file_empty,
      code: "file_empty",
    };
  }

  if (file.size > MATERIAL_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.file_too_large,
      code: "file_too_large",
    };
  }

  const extension = getFileExtension(file.name);
  const matchedType = Object.entries(MATERIAL_ALLOWED_FILE_TYPES).find(
    ([, config]) =>
      config.extension === extension && config.mimeType === file.type,
  );

  if (!matchedType) {
    return {
      ok: false,
      error: MATERIAL_SAFE_ERROR_MESSAGES.unsupported_file_type,
      code: "unsupported_file_type",
    };
  }

  const [type, config] = matchedType;

  return {
    ok: true,
    data: {
      file,
      type: type as ValidatedMaterialFile["type"],
      originalFileName: file.name,
      fileSizeBytes: file.size,
      mimeType: config.mimeType,
      extension: config.extension,
    },
  };
}
