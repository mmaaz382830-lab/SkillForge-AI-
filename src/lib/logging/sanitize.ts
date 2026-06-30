import "server-only";

import type { SafeLogMetadata, SafeLogValue } from "./types";

const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 3;
const MAX_ARRAY_ITEMS = 20;
const MAX_OBJECT_KEYS = 50;

const DANGEROUS_KEYS = new Set([
  "prompt",
  "rawprompt",
  "systemprompt",
  "userprompt",
  "extracted_text",
  "extractedtext",
  "content",
  "notecontent",
  "rawmodeloutput",
  "modeloutput",
  "responsetext",
  "embedding",
  "embeddings",
  "vector",
  "apikey",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "password",
  "stack",
  "stacktrace",
  "storagepath",
  "storage_path",
  "privatepath",
]);

function normalizeKey(key: string): string {
  return key.replace(/[\s_-]/g, "").toLowerCase();
}

function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(normalizeKey(key)) || DANGEROUS_KEYS.has(key.toLowerCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

function sanitizeString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
}

function sanitizeValue(value: unknown, depth: number): SafeLogValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) {
      return [];
    }

    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1))
      .filter((item): item is SafeLogValue => item !== undefined);
  }

  if (isPlainObject(value)) {
    if (depth >= MAX_DEPTH) {
      return {};
    }

    const sanitized: SafeLogMetadata = {};
    const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);

    for (const [key, nestedValue] of entries) {
      if (isDangerousKey(key)) {
        continue;
      }

      const sanitizedValue = sanitizeValue(nestedValue, depth + 1);

      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }

    return sanitized;
  }

  return undefined;
}

export function sanitizeMetadata(metadata: unknown): SafeLogMetadata {
  try {
    const sanitized = sanitizeValue(metadata, 0);

    return isPlainObject(sanitized) ? sanitized : {};
  } catch {
    return {};
  }
}

