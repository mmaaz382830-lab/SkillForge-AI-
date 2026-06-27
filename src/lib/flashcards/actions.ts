"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import {
  AI_SAFE_MESSAGES,
  AiConfigurationError,
  AiInvalidOutputError,
  AiProviderError,
  AiUsageLimitError,
  buildFlashcardsPrompt,
  generateValidatedJson,
  getSafeAiErrorMessage,
  logAiUsageEvent,
} from "@/lib/ai";
import {
  aiFlashcardsOutputSchema,
  type AiFlashcardsOutput,
} from "@/lib/ai/schemas";
import { assertAiUsageAllowed } from "@/lib/ai/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Flashcard,
  FlashcardActionResult,
  FlashcardDeck,
  FlashcardGenerationInput,
} from "@/types/flashcards";

import { getAuthenticatedFlashcardUserId } from "./queries";
import { validateFlashcardGenerationInput } from "./validation";

const DECK_SELECT =
  "id,user_id,material_id,title,topic,card_count,created_at,updated_at";

const FLASHCARD_GENERATION_VALIDATION_HINT =
  "Return deck_title, topic, and exactly the requested number of flashcards. Each flashcard needs order_index, front, back, topic, and difficulty.";

type CompletedMaterialForFlashcards = {
  id: string;
  title: string;
  extracted_text: string | null;
  processing_status: string;
  deleted_at: string | null;
};

function getErrorCode(error: unknown): string {
  if (error instanceof AiInvalidOutputError) {
    return "INVALID_OUTPUT";
  }

  if (error instanceof AiConfigurationError) {
    return "AI_CONFIGURATION_UNAVAILABLE";
  }

  if (error instanceof AiProviderError) {
    return `AI_PROVIDER_${error.code.toUpperCase()}`;
  }

  return "FLASHCARD_GENERATION_FAILED";
}

function buildFlashcardUsageMetadata(input: {
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs?: number;
  retryCount?: number;
  errorCode?: string;
}) {
  return {
    material_id: input.materialId,
    requested_count: input.requestedCount,
    difficulty: input.difficulty,
    duration_ms: input.durationMs ?? null,
    retry_count: input.retryCount ?? null,
    error_code: input.errorCode ?? null,
  };
}

async function logFlashcardGenerationError(input: {
  userId: string;
  materialId: string;
  requestedCount: number;
  difficulty: string;
  durationMs: number;
  retryCount?: number;
  errorCode: string;
}) {
  await logAiUsageEvent({
    userId: input.userId,
    featureType: "flashcards",
    status: "error",
    errorCode: input.errorCode,
    metadata: buildFlashcardUsageMetadata(input),
  });
}

async function loadOwnedCompletedMaterialForFlashcards(input: {
  materialId: string;
  userId: string;
}): Promise<CompletedMaterialForFlashcards | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id,title,extracted_text,processing_status,deleted_at")
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle<CompletedMaterialForFlashcards>();

  if (error || !data) {
    return null;
  }

  if (data.processing_status !== "completed" || !data.extracted_text?.trim()) {
    return null;
  }

  return data;
}

function normalizeGeneratedFlashcards(input: {
  output: AiFlashcardsOutput;
  expectedCount: number;
}): Array<Pick<Flashcard, "front" | "back" | "topic" | "difficulty" | "order_index">> {
  if (input.output.flashcards.length !== input.expectedCount) {
    throw new AiInvalidOutputError();
  }

  return [...input.output.flashcards]
    .sort((first, second) => first.order_index - second.order_index)
    .map((card, index) => ({
      front: card.front,
      back: card.back,
      topic: card.topic ?? input.output.topic ?? null,
      difficulty: card.difficulty,
      order_index: index + 1,
    }));
}

function revalidateFlashcardViews() {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.flashcards);
}

function buildExactFlashcardsOutputSchema(expectedCount: number) {
  return aiFlashcardsOutputSchema.superRefine((output, context) => {
    if (output.flashcards.length !== expectedCount) {
      context.addIssue({
        code: "custom",
        path: ["flashcards"],
        message: `Expected exactly ${expectedCount} flashcards.`,
      });
    }
  });
}

export async function generateFlashcardDeck(
  input: FlashcardGenerationInput,
): Promise<FlashcardActionResult<FlashcardDeck>> {
  const startedAt = Date.now();
  const user = await getAuthenticatedFlashcardUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validateFlashcardGenerationInput(input);

  if (!validation.ok) {
    return validation;
  }

  const material = await loadOwnedCompletedMaterialForFlashcards({
    materialId: validation.data.material_id,
    userId: user.data,
  });

  if (!material) {
    return {
      ok: false,
      error: "Select a processed material first.",
    };
  }

  const usageMetadata = buildFlashcardUsageMetadata({
    materialId: validation.data.material_id,
    requestedCount: validation.data.card_count,
    difficulty: validation.data.difficulty,
  });

  try {
    await assertAiUsageAllowed({
      userId: user.data,
      featureType: "flashcards",
      metadata: usageMetadata,
    });

    const prompt = buildFlashcardsPrompt({
      topic: validation.data.topic ?? material.title,
      difficulty: validation.data.difficulty,
      materialContext: material.extracted_text ?? undefined,
      cardCount: validation.data.card_count,
    });

    const generated = await generateValidatedJson({
      prompt,
      schema: buildExactFlashcardsOutputSchema(validation.data.card_count),
      validationHint: FLASHCARD_GENERATION_VALIDATION_HINT,
      temperature: 0.25,
    });
    const cards = normalizeGeneratedFlashcards({
      output: generated.data,
      expectedCount: validation.data.card_count,
    });
    const supabase = await createSupabaseServerClient();
    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: user.data,
        material_id: validation.data.material_id,
        title: generated.data.deck_title,
        topic: generated.data.topic ?? validation.data.topic,
        card_count: cards.length,
      })
      .select(DECK_SELECT)
      .maybeSingle<FlashcardDeck>();

    if (deckError || !deck) {
      const errorCode = "FLASHCARD_DECK_SAVE_FAILED";
      await logFlashcardGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.card_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return {
        ok: false,
        error: "Could not save flashcards. Please try again.",
      };
    }

    const { error: cardsError } = await supabase.from("flashcards").insert(
      cards.map((card) => ({
        deck_id: deck.id,
        user_id: user.data,
        front: card.front,
        back: card.back,
        topic: card.topic,
        difficulty: card.difficulty,
        order_index: card.order_index,
      })),
    );

    if (cardsError) {
      await supabase
        .from("flashcard_decks")
        .delete()
        .eq("id", deck.id)
        .eq("user_id", user.data);

      const errorCode = "FLASHCARD_CARD_SAVE_FAILED";
      await logFlashcardGenerationError({
        userId: user.data,
        materialId: validation.data.material_id,
        requestedCount: validation.data.card_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
        errorCode,
      });

      return {
        ok: false,
        error: "Could not save flashcards. Please try again.",
      };
    }

    await logAiUsageEvent({
      userId: user.data,
      featureType: "flashcards",
      status: "success",
      provider: generated.provider,
      model: generated.model,
      metadata: buildFlashcardUsageMetadata({
        materialId: validation.data.material_id,
        requestedCount: validation.data.card_count,
        difficulty: validation.data.difficulty,
        durationMs: Date.now() - startedAt,
        retryCount: generated.retryCount,
      }),
    });

    revalidateFlashcardViews();

    return {
      ok: true,
      data: deck,
    };
  } catch (error) {
    if (error instanceof AiUsageLimitError) {
      return {
        ok: false,
        error: error.safeMessage,
      };
    }

    const errorCode = getErrorCode(error);
    await logFlashcardGenerationError({
      userId: user.data,
      materialId: validation.data.material_id,
      requestedCount: validation.data.card_count,
      difficulty: validation.data.difficulty,
      durationMs: Date.now() - startedAt,
      errorCode,
    });

    if (error instanceof AiConfigurationError) {
      return {
        ok: false,
        error: AI_SAFE_MESSAGES.configurationUnavailable,
      };
    }

    return {
      ok: false,
      error: getSafeAiErrorMessage(error),
    };
  }
}

export async function deleteFlashcardDeck(
  deckId: string,
): Promise<FlashcardActionResult<{ id: string }>> {
  const user = await getAuthenticatedFlashcardUserId();

  if (!user.ok) {
    return user;
  }

  const normalizedDeckId = deckId.trim();

  if (!normalizedDeckId) {
    return {
      ok: false,
      error: "Flashcard deck not found.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: deck, error: deckLookupError } = await supabase
    .from("flashcard_decks")
    .select("id")
    .eq("id", normalizedDeckId)
    .eq("user_id", user.data)
    .maybeSingle<{ id: string }>();

  if (deckLookupError) {
    return {
      ok: false,
      error: "Could not delete flashcard deck.",
    };
  }

  if (!deck) {
    return {
      ok: false,
      error: "You do not have access to this item.",
    };
  }

  const { error: cardsError } = await supabase
    .from("flashcards")
    .delete()
    .eq("deck_id", deck.id)
    .eq("user_id", user.data);

  if (cardsError) {
    return {
      ok: false,
      error: "Could not delete flashcard deck.",
    };
  }

  const { error: deckError } = await supabase
    .from("flashcard_decks")
    .delete()
    .eq("id", deck.id)
    .eq("user_id", user.data);

  if (deckError) {
    return {
      ok: false,
      error: "Could not delete flashcard deck.",
    };
  }

  revalidateFlashcardViews();

  return {
    ok: true,
    data: { id: deck.id },
  };
}