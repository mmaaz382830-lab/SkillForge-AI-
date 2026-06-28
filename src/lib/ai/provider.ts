import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  AI_PROVIDER,
  DEFAULT_GEMINI_TEXT_MODEL,
  DEFAULT_GEMINI_TEMPERATURE,
} from "@/lib/ai/constants";
import { getGeminiApiKey } from "@/lib/ai/env";
import {
  AiConfigurationError,
  AiProviderError,
  AI_SAFE_MESSAGES,
} from "@/lib/ai/errors";

export {
  AI_PROVIDER,
  DEFAULT_GEMINI_TEXT_MODEL,
  DEFAULT_GEMINI_TEMPERATURE,
} from "@/lib/ai/constants";

type GenerateTextOptions = {
  model?: string;
  temperature?: number;
  responseMimeType?: "application/json" | "text/plain";
};

export type GeminiTextGeneration = {
  text: string;
  model: string;
  provider: typeof AI_PROVIDER;
};

function classifyProviderError(error: unknown): AiProviderError["code"] {
  if (error instanceof AiConfigurationError) {
    throw error;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("timeout") || message.includes("timed out")) {
    return "timeout";
  }

  if (
    message.includes("api key") ||
    message.includes("apikey") ||
    message.includes("authentication") ||
    message.includes("permission") ||
    message.includes("unauthorized")
  ) {
    return "failed";
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

export async function generateTextWithGemini(
  prompt: string,
  options: GenerateTextOptions = {},
): Promise<GeminiTextGeneration> {
  const model = options.model ?? DEFAULT_GEMINI_TEXT_MODEL;
  const temperature = options.temperature ?? DEFAULT_GEMINI_TEMPERATURE;

  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature,
        responseMimeType: options.responseMimeType ?? "application/json",
      },
    });
    const text = response.text?.trim();

    if (!text) {
      throw new AiProviderError("failed");
    }

    return {
      text,
      model,
      provider: AI_PROVIDER,
    };
  } catch (error) {
    if (error instanceof AiProviderError || error instanceof AiConfigurationError) {
      throw error;
    }

    throw new AiProviderError(classifyProviderError(error), { cause: error });
  }
}

export function buildInvalidOutputRepairPrompt(input: {
  originalPrompt: string;
  validationHint: string;
}): string {
  return `${input.originalPrompt}

The previous response was invalid and was rejected by validation.
Return corrected JSON only. Do not include markdown fences or prose.
Validation reminder: ${input.validationHint}
Safe failure message if this cannot be satisfied: ${AI_SAFE_MESSAGES.invalidOutput}`;
}