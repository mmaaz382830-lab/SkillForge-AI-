import "server-only";

import { DEFAULT_GEMINI_TEXT_MODEL } from "@/lib/ai/constants";
import { generateTextWithGemini, type GeminiTextGeneration } from "@/lib/ai/provider";

import type { RetrievedMaterialChunk } from "./retrieval";

export const RAG_INSUFFICIENT_CONTEXT_MESSAGE =
  "I could not find enough context in your uploaded material.";

export type RagSourceSnippet = {
  chunk_id: string;
  material_id: string;
  chunk_index: number;
  snippet: string;
  similarity: number;
};

export type GroundedAnswerResult = {
  answer: string;
  insufficient_context: boolean;
  source_chunk_ids: string[];
  sources: RagSourceSnippet[];
  model: string | null;
  provider: GeminiTextGeneration["provider"] | null;
  retry_count: 0;
};

const MAX_CONTEXT_CHUNKS = 16;
const MAX_CONTEXT_CHARS_PER_CHUNK = 1_800;
const SOURCE_SNIPPET_CHARS = 260;

function trimForContext(content: string): string {
  return content.trim().slice(0, MAX_CONTEXT_CHARS_PER_CHUNK);
}

function buildRetrievedContext(chunks: RetrievedMaterialChunk[]): string {
  return chunks
    .slice(0, MAX_CONTEXT_CHUNKS)
    .map((chunk, index) => {
      return [
        `Context ${index + 1}`,
        `Chunk index: ${chunk.chunk_index}`,
        trimForContext(chunk.content),
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function normalizeSnippet(content: string): string {
  const snippet = content.replace(/\s+/g, " ").trim().slice(0, SOURCE_SNIPPET_CHARS);

  return snippet.length === SOURCE_SNIPPET_CHARS ? `${snippet}...` : snippet;
}

export function buildSourceSnippets(
  chunks: RetrievedMaterialChunk[],
): RagSourceSnippet[] {
  return chunks.map((chunk) => ({
    chunk_id: chunk.id,
    material_id: chunk.material_id,
    chunk_index: chunk.chunk_index,
    snippet: normalizeSnippet(chunk.content),
    similarity: chunk.similarity,
  }));
}

function buildGroundedAnswerPrompt(input: {
  question: string;
  chunks: RetrievedMaterialChunk[];
}): string {
  return `You are SkillForge AI, a study assistant that answers using only the student's uploaded material.

STUDENT QUESTION:
${input.question}

MATERIAL CONTEXT:
${buildRetrievedContext(input.chunks)}

GROUNDING RULES:
- Use ONLY the material context above.
- Do not add general knowledge or facts that are not supported by the context.
- Do not invent citations, page numbers, source labels, or quote locations.
- Do not mention chunk IDs, similarity scores, retrieval, embeddings, or internal system details.
- If the context has no relevant information for the question, return exactly this sentence and nothing else:
${RAG_INSUFFICIENT_CONTEXT_MESSAGE}

ANSWER STYLE:
- Return plain text or markdown only, not JSON.
- Use short paragraphs.
- Use "- " bullets for lists.
- Use "##" headings only when they make the answer easier to scan.
- Be concise, helpful, and student-friendly.
- For broad overview questions, summarize the useful topics present in the context instead of refusing because the context is partial.`;
}

function normalizePlainTextAnswer(text: string): {
  answer: string;
  insufficient_context: boolean;
} {
  const answer = text.trim();

  if (!answer) {
    return {
      answer: RAG_INSUFFICIENT_CONTEXT_MESSAGE,
      insufficient_context: true,
    };
  }

  const normalized = answer.toLowerCase();
  const insufficient =
    answer === RAG_INSUFFICIENT_CONTEXT_MESSAGE ||
    normalized.includes("could not find enough context") ||
    normalized.includes("not enough context") ||
    normalized.includes("insufficient context");

  return {
    answer: insufficient ? RAG_INSUFFICIENT_CONTEXT_MESSAGE : answer,
    insufficient_context: insufficient,
  };
}

export async function generateGroundedAnswer(input: {
  question: string;
  chunks: RetrievedMaterialChunk[];
}): Promise<GroundedAnswerResult> {
  const question = input.question.trim();
  const chunks = input.chunks.filter((chunk) => chunk.content.trim());

  if (!question || chunks.length === 0) {
    return {
      answer: RAG_INSUFFICIENT_CONTEXT_MESSAGE,
      insufficient_context: true,
      source_chunk_ids: [],
      sources: [],
      model: null,
      provider: null,
      retry_count: 0,
    };
  }

  const generation = await generateTextWithGemini(
    buildGroundedAnswerPrompt({ question, chunks }),
    {
      model: DEFAULT_GEMINI_TEXT_MODEL,
      temperature: 0.1,
      responseMimeType: "text/plain",
    },
  );
  const normalized = normalizePlainTextAnswer(generation.text);
  const sourceChunkIds = normalized.insufficient_context
    ? []
    : chunks.map((chunk) => chunk.id);

  return {
    answer: normalized.answer,
    insufficient_context: normalized.insufficient_context,
    source_chunk_ids: sourceChunkIds,
    sources: normalized.insufficient_context ? [] : buildSourceSnippets(chunks),
    model: generation.model,
    provider: generation.provider,
    retry_count: 0,
  };
}