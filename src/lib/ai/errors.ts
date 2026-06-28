export const AI_SAFE_MESSAGES = {
  configurationUnavailable:
    "AI generation is unavailable right now. Please try again later.",
  invalidOutput: "Could not generate a valid result. Please try again.",
  requestFailed: "AI request failed. Please try again.",
  requestTimedOut: "AI request timed out. Please try again.",
  serviceUnavailable:
    "AI service is temporarily unavailable. Please try again later.",
  usageLimitReached:
    "Usage limit reached. Please try again later or upgrade your plan.",
  missingGeminiApiKey: "Missing GEMINI_API_KEY. AI generation is unavailable.",
} as const;

export const AI_CONFIGURATION_MESSAGES = {
  missingGeminiApiKey: AI_SAFE_MESSAGES.missingGeminiApiKey,
} as const;

type AiErrorOptions = {
  cause?: unknown;
};

export class AiConfigurationError extends Error {
  readonly safeMessage: string;
  readonly cause?: unknown;

  constructor(
    message: string = AI_SAFE_MESSAGES.configurationUnavailable,
    options?: AiErrorOptions,
  ) {
    super(message);
    this.name = "AiConfigurationError";
    this.safeMessage = message;
    this.cause = options?.cause;
  }
}

export class AiProviderError extends Error {
  readonly safeMessage: string;
  readonly code: "failed" | "timeout" | "unavailable";
  readonly cause?: unknown;

  constructor(
    code: AiProviderError["code"] = "failed",
    options?: AiErrorOptions,
  ) {
    const message = getProviderSafeMessage(code);

    super(message);
    this.name = "AiProviderError";
    this.safeMessage = message;
    this.code = code;
    this.cause = options?.cause;
  }
}

export class AiInvalidOutputError extends Error {
  readonly safeMessage: string;
  readonly cause?: unknown;
  readonly rawText?: string;

  constructor(options?: AiErrorOptions & { rawText?: string }) {
    super(AI_SAFE_MESSAGES.invalidOutput);
    this.name = "AiInvalidOutputError";
    this.safeMessage = AI_SAFE_MESSAGES.invalidOutput;
    this.cause = options?.cause;
    this.rawText = options?.rawText;
  }
}

export class AiUsageLimitError extends Error {
  readonly safeMessage: string;

  constructor() {
    super(AI_SAFE_MESSAGES.usageLimitReached);
    this.name = "AiUsageLimitError";
    this.safeMessage = AI_SAFE_MESSAGES.usageLimitReached;
  }
}

function getProviderSafeMessage(code: AiProviderError["code"]): string {
  if (code === "timeout") {
    return AI_SAFE_MESSAGES.requestTimedOut;
  }

  if (code === "unavailable") {
    return AI_SAFE_MESSAGES.serviceUnavailable;
  }

  return AI_SAFE_MESSAGES.requestFailed;
}

export function getSafeAiErrorMessage(error: unknown): string {
  if (
    error instanceof AiConfigurationError ||
    error instanceof AiProviderError ||
    error instanceof AiInvalidOutputError ||
    error instanceof AiUsageLimitError
  ) {
    return error.safeMessage;
  }

  return AI_SAFE_MESSAGES.requestFailed;
}