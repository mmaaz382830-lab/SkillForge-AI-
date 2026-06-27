import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Flashcard,
  FlashcardActionResult,
  FlashcardDeck,
  FlashcardDeckView,
} from "@/types/flashcards";

const DECK_SELECT =
  "id,user_id,material_id,title,topic,card_count,created_at,updated_at";
const CARD_SELECT =
  "id,deck_id,user_id,front,back,topic,difficulty,order_index,created_at,updated_at";

export async function getAuthenticatedFlashcardUserId(): Promise<
  FlashcardActionResult<string>
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      error: "Please log in to continue.",
    };
  }

  return {
    ok: true,
    data: data.user.id,
  };
}

export async function listFlashcardDeckViews(): Promise<
  FlashcardActionResult<FlashcardDeckView[]>
> {
  const user = await getAuthenticatedFlashcardUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const [decksResult, cardsResult] = await Promise.all([
    supabase
      .from("flashcard_decks")
      .select(DECK_SELECT)
      .eq("user_id", user.data)
      .order("created_at", { ascending: false })
      .returns<FlashcardDeck[]>(),
    supabase
      .from("flashcards")
      .select(CARD_SELECT)
      .eq("user_id", user.data)
      .order("order_index", { ascending: true })
      .returns<Flashcard[]>(),
  ]);

  if (decksResult.error || cardsResult.error) {
    return {
      ok: false,
      error: "Could not load flashcards.",
    };
  }

  const cardsByDeckId = new Map<string, Flashcard[]>();

  for (const card of cardsResult.data ?? []) {
    const cards = cardsByDeckId.get(card.deck_id) ?? [];
    cards.push(card);
    cardsByDeckId.set(card.deck_id, cards);
  }

  return {
    ok: true,
    data: (decksResult.data ?? []).map((deck) => ({
      id: deck.id,
      material_id: deck.material_id,
      title: deck.title,
      topic: deck.topic,
      card_count: deck.card_count,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
      cards: (cardsByDeckId.get(deck.id) ?? []).map((card) => ({
        id: card.id,
        deck_id: card.deck_id,
        front: card.front,
        back: card.back,
        topic: card.topic,
        difficulty: card.difficulty,
        order_index: card.order_index,
        created_at: card.created_at,
        updated_at: card.updated_at,
      })),
    })),
  };
}
