import "server-only";

import { z } from "zod";

import { DEFAULT_GEMINI_TEXT_MODEL } from "@/lib/ai/constants";
import { generateValidatedJson } from "@/lib/ai/generate";
import type { GenerateValidatedJsonResult } from "@/lib/ai/generate";

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
  provider: GenerateValidatedJsonResult<GroundedAnswerOutput>["provider"] | null;
  retry_count: 0 | 1;
};

type GroundedAnswerOutput = z.infer<typeof groundedAnswerOutputSchema>;

const MAX_CONTEXT_CHUNKS = 12;
const MAX_CONTEXT_CHARS_PER_CHUNK = 1_800;
const SOURCE_SNIPPET_CHARS = 260;

const groundedAnswerOutputSchema = z.object({
  answer: z.string().trim().min(1),
  insufficient_context: z.boolean(),
});

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
        `Similarity: ${chunk.similarity.toFixed(4)}`,
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
  return `You are SkillForge AI, a friendly study assistant that helps students understand their own notes and materials.

TASK:
Answer the student's question using ONLY the retrieved material sections below.

STUDENT QUESTION:
${input.question}

MATERIAL SECTIONS:
${buildRetrievedContext(input.chunks)}

FORMATTING RULES:
- Write in plain, easy-to-understand language a student would appreciate.
- Use short paragraphs (2-4 sentences max each).
- Use bullet points (using "- ") when listing steps, items, or multiple points.
- Use a simple heading (e.g. "## Topic") only when the answer covers clearly distinct sub-topics.
- Do NOT write dense walls of text.
- Keep the total answer concise and focused on what the student asked.

CONTENT RULES:
- Use ONLY the material sections provided above. Do not add general knowledge.
- Do not invent facts, citations, page numbers, or source references.
- Do not mention internal chunk IDs, similarity scores, or technical retrieval details in the answer.
- Return valid JSON only. Do not include markdown fences or prose outside JSON.

INSUFFICIENT CONTEXT RULE:
- Set insufficient_context to true ONLY when the retrieved sections contain absolutely no relevant information at all, have zero connection to the query, and it is completely impossible to formulate any response.
- If the retrieved sections contain relevant keywords, terms, or context, you MUST synthesize an answer using that context and set insufficient_context to false.
- For broad overview questions (e.g., "describe all pdfs", "summarize materials", "explain important topics", "what is backend in this PDF"), answer using whatever content or topics are present in the sections. Do not set insufficient_context to true just because the explanation in the text is brief or partial.
- If the material only contains a list of questions, terms, or a syllabus rather than full explanations, answer by stating what the material contains (e.g., "The material contains a list of study questions and topics on [x, y, z]") and list those items, instead of saying you have insufficient context.
- When in doubt and you have ANY useful context (even just keywords or titles), set insufficient_context to false and give the best answer you can.

Return JSON with this exact shape:
{
  "answer": "Student-friendly answer using bullet points and short paragraphs, or the exact insufficient context message",
  "insufficient_context": false
}`;
}

import { AiInvalidOutputError } from "@/lib/ai/errors";

function parseOrFallbackGroundedAnswer(text: string): { answer: string; insufficient_context: boolean } {
  const trimmed = text.trim();

  // 1. Try to clean up and parse JSON if possible
  try {
    const cleanText = trimmed.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, "$1").trim();
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const jsonCandidate = cleanText.slice(start, end + 1);
      const parsed = JSON.parse(jsonCandidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
        const insufficient = typeof parsed.insufficient_context === "boolean" ? parsed.insufficient_context : false;
        if (answer) {
          return { answer, insufficient_context: insufficient };
        }
      }
    }
  } catch {
    // ignore, fallback below
  }

  // 2. Fallback: treat raw text as the answer.
  const isInsufficient =
    trimmed.toLowerCase().includes("insufficient context") ||
    trimmed.toLowerCase().includes("not enough context") ||
    trimmed.toLowerCase().includes("could not find enough context") ||
    trimmed === RAG_INSUFFICIENT_CONTEXT_MESSAGE;

  return {
    answer: trimmed,
    insufficient_context: isInsufficient,
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

  try {
    const generation = await generateValidatedJson({
      prompt: buildGroundedAnswerPrompt({ question, chunks }),
      schema: groundedAnswerOutputSchema,
      validationHint:
        "Return { answer: string, insufficient_context: boolean }. If context is insufficient, answer must be the exact insufficient-context sentence.",
      model: DEFAULT_GEMINI_TEXT_MODEL,
      temperature: 0.1,
    });

    const insufficient = generation.data.insufficient_context;
    const answer = insufficient
      ? RAG_INSUFFICIENT_CONTEXT_MESSAGE
      : generation.data.answer.trim();
    const sourceChunkIds = insufficient ? [] : chunks.map((chunk) => chunk.id);

    return {
      answer,
      insufficient_context: insufficient,
      source_chunk_ids: sourceChunkIds,
      sources: insufficient ? [] : buildSourceSnippets(chunks),
      model: generation.model,
      provider: generation.provider,
      retry_count: generation.retryCount,
    };
  } catch (error) {
    if (error instanceof AiInvalidOutputError && error.rawText) {
      const fallbackResult = parseOrFallbackGroundedAnswer(error.rawText);
      const insufficient = fallbackResult.insufficient_context;
      const answer = insufficient
        ? RAG_INSUFFICIENT_CONTEXT_MESSAGE
        : fallbackResult.answer.trim();
      const sourceChunkIds = insufficient ? [] : chunks.map((chunk) => chunk.id);

      return {
        answer,
        insufficient_context: insufficient,
        source_chunk_ids: sourceChunkIds,
        sources: insufficient ? [] : buildSourceSnippets(chunks),
        model: DEFAULT_GEMINI_TEXT_MODEL,
        provider: "gemini",
        retry_count: 1,
      };
    }
    throw error;
  }
}
