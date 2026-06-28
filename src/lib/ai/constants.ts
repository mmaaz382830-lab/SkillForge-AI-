export const AI_PROVIDER = "gemini" as const;

export const DEFAULT_GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const DEFAULT_GEMINI_TEMPERATURE = 0.25;

export const DEFAULT_GEMINI_EMBEDDING_MODEL = "gemini-embedding-2";
// Gemini defaults to 3072 dimensions, but pgvector HNSW indexes support up to 2000.
// Use Gemini's recommended 1536 output dimension so retrieval can stay HNSW-indexed.
export const GEMINI_EMBEDDING_DIMENSION = 1536;

export const RAG_DEFAULT_TOP_K = 5;
export const RAG_CHUNK_SIZE_CHARS = 1_200;
export const RAG_CHUNK_OVERLAP_CHARS = 200;
