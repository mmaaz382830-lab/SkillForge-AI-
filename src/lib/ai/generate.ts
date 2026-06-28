import type { z } from "zod";

import { AiInvalidOutputError } from "@/lib/ai/errors";
import { parseJsonObjectFromText } from "@/lib/ai/json";
import {
  buildInvalidOutputRepairPrompt,
  generateTextWithGemini,
  type GeminiTextGeneration,
} from "@/lib/ai/provider";

type GenerateValidatedJsonOptions<TSchema extends z.ZodType> = {
  prompt: string;
  schema: TSchema;
  validationHint: string;
  model?: string;
  temperature?: number;
};

export type GenerateValidatedJsonResult<T> = {
  data: T;
  model: string;
  provider: GeminiTextGeneration["provider"];
  retryCount: 0 | 1;
};

function validateParsedJson<TSchema extends z.ZodType>(
  schema: TSchema,
  text: string,
): z.infer<TSchema> {
  const parsed = parseJsonObjectFromText(text);
  const result = schema.safeParse(parsed);

  if (!result.success) {
    throw new AiInvalidOutputError({ cause: result.error });
  }

  return result.data;
}

export async function generateValidatedJson<TSchema extends z.ZodType>(
  options: GenerateValidatedJsonOptions<TSchema>,
): Promise<GenerateValidatedJsonResult<z.infer<TSchema>>> {
  const firstGeneration = await generateTextWithGemini(options.prompt, {
    model: options.model,
    temperature: options.temperature,
  });

  try {
    return {
      data: validateParsedJson(options.schema, firstGeneration.text),
      model: firstGeneration.model,
      provider: firstGeneration.provider,
      retryCount: 0,
    };
  } catch (error) {
    if (!(error instanceof AiInvalidOutputError)) {
      throw error;
    }
  }

  const repairPrompt = buildInvalidOutputRepairPrompt({
    originalPrompt: options.prompt,
    validationHint: options.validationHint,
  });

  let retryGeneration;
  try {
    retryGeneration = await generateTextWithGemini(repairPrompt, {
      model: options.model,
      temperature: options.temperature,
    });
  } catch (error) {
    throw new AiInvalidOutputError({ cause: error, rawText: firstGeneration.text });
  }

  try {
    return {
      data: validateParsedJson(options.schema, retryGeneration.text),
      model: retryGeneration.model,
      provider: retryGeneration.provider,
      retryCount: 1,
    };
  } catch (error) {
    throw new AiInvalidOutputError({
      cause: error,
      rawText: retryGeneration.text || firstGeneration.text,
    });
  }
}