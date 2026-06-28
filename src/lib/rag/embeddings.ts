import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  DEFAULT_GEMINI_EMBEDDING_MODEL,
  GEMINI_EMBEDDING_DIMENSION,
} from "@/lib/ai/constants";
import { getGeminiApiKey } from "@/lib/ai/env";
import {
  AiConfigurationError,
  AiProviderError,
} from "@/lib/ai/errors";

type GenerateEmbeddingOptions = {
  model?: string;
};

export type GeminiEmbedding = {
  values: number[];
  model: string;
  dimension: number;
};

function classifyEmbeddingError(error: unknown): AiProviderError["code"] {
  if (error instanceof AiConfigurationError) {
    throw error;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("timeout") || message.includes("timed out")) {
    return "timeout";
  }

  if (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("unavailable") ||
    message.includes("overloaded")
  ) {
    return "unavailable";
  }

  return "failed";
}

function validateEmbedding(values: unknown): number[] {
  if (!Array.isArray(values)) {
    throw new AiProviderError("failed");
  }

  const embedding = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  if (embedding.length !== GEMINI_EMBEDDING_DIMENSION) {
    throw new AiProviderError("failed");
  }

  return embedding;
}

export async function generateGeminiEmbedding(
  content: string,
  options: GenerateEmbeddingOptions = {},
): Promise<GeminiEmbedding> {
  const model = options.model ?? DEFAULT_GEMINI_EMBEDDING_MODEL;

  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await ai.models.embedContent({
      model,
      contents: content,
      config: {
        outputDimensionality: GEMINI_EMBEDDING_DIMENSION,
      },
    });
    const values = validateEmbedding(response.embeddings?.[0]?.values);

    return {
      values,
      model,
      dimension: values.length,
    };
  } catch (error) {
    if (error instanceof AiProviderError || error instanceof AiConfigurationError) {
      throw error;
    }

    throw new AiProviderError(classifyEmbeddingError(error), { cause: error });
  }
}

export async function generateGeminiEmbeddings(
  contents: string[],
  options: GenerateEmbeddingOptions = {},
): Promise<GeminiEmbedding[]> {
  const embeddings: GeminiEmbedding[] = [];

  for (const content of contents) {
    embeddings.push(await generateGeminiEmbedding(content, options));
  }

  return embeddings;
}

export function formatEmbeddingForPgvector(values: number[]): string {
  if (values.length !== GEMINI_EMBEDDING_DIMENSION) {
    throw new AiProviderError("failed");
  }

  return `[${values.join(",")}]`;
}
