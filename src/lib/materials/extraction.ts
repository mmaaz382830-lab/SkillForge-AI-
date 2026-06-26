import { Buffer } from "node:buffer";
import { createRequire } from "node:module";

import type {
  ExtractedMaterialText,
  MaterialActionResult,
} from "@/types/materials";

import { MATERIAL_SAFE_ERROR_MESSAGES } from "./constants";
import {
  getSafeProcessingError,
  MaterialProcessingError,
  validateExtractedText,
  validateMaterialFile,
} from "./validation";

// Server-side only. Do not import this module from client components.

type PdfParseResult = {
  text?: string;
};

type PdfParse = (buffer: Buffer) => Promise<PdfParseResult>;

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParse;

function logPdfExtract(input: {
  step: "buffer" | "parse" | "normalize" | "validate";
  byteLength?: number;
  error?: unknown;
}) {
  const message =
    input.error && typeof input.error === "object" && "message" in input.error
      ? String(input.error.message)
      : input.error
        ? "Unknown error"
        : undefined;

  console.error("[materials:pdf-extract:error]", {
    step: input.step,
    byteLength: input.byteLength,
    message,
  });
}

export async function extractTextFromTxtFile(file: File): Promise<string> {
  const text = validateExtractedText(await file.text());

  if (!text.ok) {
    throw new MaterialProcessingError(text.code ?? "extraction_empty");
  }

  return text.data;
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  let byteLength = 0;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    byteLength = buffer.byteLength;

    if (byteLength <= 0) {
      logPdfExtract({ step: "buffer", byteLength });
      throw new MaterialProcessingError("file_empty");
    }

    const result = await pdfParse(buffer);
    const rawText = result.text ?? "";

    if (!rawText.trim()) {
      logPdfExtract({
        step: "parse",
        byteLength,
        error: new Error("PDF parser returned no extractable text."),
      });
      throw new MaterialProcessingError("extraction_empty");
    }

    const text = validateExtractedText(rawText);

    if (!text.ok) {
      logPdfExtract({
        step: "normalize",
        byteLength,
        error: new Error(text.error),
      });
      throw new MaterialProcessingError("extraction_empty");
    }

    return text.data;
  } catch (error) {
    const step = error instanceof MaterialProcessingError ? "validate" : "parse";
    logPdfExtract({ step, byteLength, error });

    if (error instanceof MaterialProcessingError) {
      throw error;
    }

    throw new MaterialProcessingError("pdf_unreadable");
  }
}

export async function extractTextFromMaterialFile(
  file: File,
): Promise<MaterialActionResult<ExtractedMaterialText>> {
  try {
    const validation = validateMaterialFile(file);

    if (!validation.ok) {
      return validation;
    }

    const text =
      validation.data.type === "txt"
        ? await extractTextFromTxtFile(file)
        : await extractTextFromPdfFile(file);

    return {
      ok: true,
      data: {
        text,
        type: validation.data.type,
      },
    };
  } catch (error) {
    const safeError = getSafeProcessingError(error);

    if (safeError.code === "pdf_unreadable") {
      return {
        ok: false,
        error: MATERIAL_SAFE_ERROR_MESSAGES.pdf_unreadable,
        code: "pdf_unreadable",
      };
    }

    return safeError;
  }
}