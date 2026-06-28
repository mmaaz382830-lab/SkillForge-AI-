import "server-only";

import { RAG_DEFAULT_TOP_K } from "@/lib/ai/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  formatEmbeddingForPgvector,
  generateGeminiEmbedding,
} from "./embeddings";

export type RetrievedMaterialChunk = {
  id: string;
  material_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

type MatchMaterialChunkRow = {
  id: string;
  material_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number | null;
};

type RetrieveMaterialChunksInput = {
  question: string;
  materialId?: string | null;
  topK?: number;
};

const MAX_RAG_MATCH_COUNT = 20;

function normalizeMatchCount(topK: number | undefined): number {
  return Math.max(1, Math.min(topK ?? RAG_DEFAULT_TOP_K, MAX_RAG_MATCH_COUNT));
}

function normalizeChunk(row: MatchMaterialChunkRow): RetrievedMaterialChunk | null {
  if (!row.id || !row.material_id || !row.content.trim()) {
    return null;
  }

  return {
    id: row.id,
    material_id: row.material_id,
    chunk_index: row.chunk_index,
    content: row.content,
    metadata: row.metadata ?? {},
    similarity: row.similarity ?? 0,
  };
}

export async function retrieveMaterialChunks(
  input: RetrieveMaterialChunksInput,
): Promise<RetrievedMaterialChunk[]> {
  const question = input.question.trim();

  if (!question) {
    return [];
  }

  const queryEmbedding = await generateGeminiEmbedding(question);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("match_material_chunks", {
    query_embedding: formatEmbeddingForPgvector(queryEmbedding.values),
    match_count: normalizeMatchCount(input.topK),
    filter_material_id: input.materialId ?? null,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MatchMaterialChunkRow[])
    .map(normalizeChunk)
    .filter((chunk): chunk is RetrievedMaterialChunk => chunk !== null);
}
