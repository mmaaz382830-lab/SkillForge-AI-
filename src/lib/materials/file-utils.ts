import { MATERIAL_ALLOWED_FILE_TYPES } from "./constants";

const PATH_SEPARATOR_PATTERN = /[\\/]+/g;
const UNSAFE_FILENAME_CHARS_PATTERN = /[^a-zA-Z0-9._-]+/g;
const REPEATED_DOTS_PATTERN = /\.{2,}/g;
const REPEATED_DASHES_PATTERN = /-{2,}/g;

export function getFileExtension(fileName: string): string {
  const safeName = fileName.replace(PATH_SEPARATOR_PATTERN, "").trim();
  const lastDotIndex = safeName.lastIndexOf(".");

  if (lastDotIndex < 0 || lastDotIndex === safeName.length - 1) {
    return "";
  }

  return safeName.slice(lastDotIndex).toLowerCase();
}

export function sanitizeFileName(fileName: string): string {
  const extension = getFileExtension(fileName);
  const baseName = fileName
    .replace(PATH_SEPARATOR_PATTERN, "-")
    .replace(new RegExp(`${extension}$`, "i"), "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(UNSAFE_FILENAME_CHARS_PATTERN, "-")
    .replace(REPEATED_DOTS_PATTERN, ".")
    .replace(REPEATED_DASHES_PATTERN, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .toLowerCase();

  const safeExtension = Object.values(MATERIAL_ALLOWED_FILE_TYPES).some(
    (allowed) => allowed.extension === extension,
  )
    ? extension
    : "";

  if (!baseName) {
    return `material${safeExtension}`;
  }

  return `${baseName}${safeExtension}`;
}

export function buildMaterialStoragePath(
  userId: string,
  materialId: string,
  originalFileName: string,
): string {
  return `${userId}/${materialId}/${sanitizeFileName(originalFileName)}`;
}
