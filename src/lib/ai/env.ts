import {
  AI_CONFIGURATION_MESSAGES,
  AiConfigurationError,
} from "@/lib/ai/errors";

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new AiConfigurationError(
      AI_CONFIGURATION_MESSAGES.missingGeminiApiKey,
    );
  }

  return apiKey;
}