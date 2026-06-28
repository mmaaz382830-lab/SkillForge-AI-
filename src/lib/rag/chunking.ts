import {
  RAG_CHUNK_OVERLAP_CHARS,
  RAG_CHUNK_SIZE_CHARS,
} from "@/lib/ai/constants";

export type RagChunk = {
  chunk_index: number;
  content: string;
  character_count: number;
  token_count: number | null;
  metadata: {
    start_char: number;
    end_char: number;
  };
};

type ChunkTextOptions = {
  chunkSize?: number;
  overlap?: number;
};

const MIN_CHUNK_CHARACTERS = 80;

function normalizeChunkContent(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function findChunkEnd(text: string, start: number, targetEnd: number): number {
  if (targetEnd >= text.length) {
    return text.length;
  }

  const searchStart = Math.max(start, targetEnd - 160);
  const boundary = Math.max(
    text.lastIndexOf("\n\n", targetEnd),
    text.lastIndexOf(". ", targetEnd),
    text.lastIndexOf("? ", targetEnd),
    text.lastIndexOf("! ", targetEnd),
    text.lastIndexOf("\n", targetEnd),
    text.lastIndexOf(" ", targetEnd),
  );

  return boundary > searchStart ? boundary + 1 : targetEnd;
}

export function chunkMaterialText(
  text: string,
  options: ChunkTextOptions = {},
): RagChunk[] {
  const source = text.trim();

  if (!source) {
    return [];
  }

  const chunkSize = Math.max(200, options.chunkSize ?? RAG_CHUNK_SIZE_CHARS);
  const overlap = Math.max(
    0,
    Math.min(options.overlap ?? RAG_CHUNK_OVERLAP_CHARS, chunkSize - 1),
  );
  const chunks: RagChunk[] = [];
  let start = 0;

  while (start < source.length) {
    const targetEnd = Math.min(start + chunkSize, source.length);
    const end = findChunkEnd(source, start, targetEnd);
    const content = normalizeChunkContent(source.slice(start, end));

    if (
      content.length >= MIN_CHUNK_CHARACTERS ||
      (chunks.length === 0 && content.length > 0) ||
      end === source.length
    ) {
      chunks.push({
        chunk_index: chunks.length,
        content,
        character_count: content.length,
        token_count: null,
        metadata: {
          start_char: start,
          end_char: end,
        },
      });
    }

    if (end >= source.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks.filter((chunk) => chunk.content.length > 0);
}
