import { AiInvalidOutputError } from "@/lib/ai/errors";

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fenced?.[1]?.trim() ?? trimmed;
}

function findJsonObjectBounds(text: string): { start: number; end: number } | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }

      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return { start, end: index + 1 };
      }
    }
  }

  return null;
}

export function parseJsonObjectFromText(text: string): unknown {
  const normalized = stripJsonFence(text);
  const bounds = findJsonObjectBounds(normalized);

  if (!bounds) {
    throw new AiInvalidOutputError();
  }

  const jsonText = normalized.slice(bounds.start, bounds.end);

  try {
    const parsed: unknown = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AiInvalidOutputError();
    }

    return parsed;
  } catch (error) {
    if (error instanceof AiInvalidOutputError) {
      throw error;
    }

    throw new AiInvalidOutputError({ cause: error });
  }
}