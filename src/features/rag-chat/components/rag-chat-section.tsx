"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  askRagChatQuestion,
  createChatSession,
  indexMaterialForRag,
  loadChatSessionMessages,
} from "@/lib/rag/actions";
import type {
  ChatMessageView,
  ChatSessionListItem,
} from "@/lib/rag/queries";
import { cn } from "@/lib/utils/cn";
import type { MaterialListItem } from "@/types/materials";

type RagChatMaterial = Pick<
  MaterialListItem,
  "id" | "title" | "type" | "chunk_count" | "created_at"
>;

type RagSourceSnippet = {
  chunk_id: string;
  material_id: string;
  chunk_index: number;
  snippet: string;
  similarity: number;
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

type RagChatSectionProps = {
  initialMaterialId?: string | null;
  initialNotice?: string | null;
  materials: RagChatMaterial[];
  sessions: ChatSessionListItem[];
};

function getMessageInsufficientContext(message: ChatMessageView): boolean {
  return Boolean(
    message.metadata &&
      typeof message.metadata === "object" &&
      "insufficient_context" in message.metadata &&
      message.metadata.insufficient_context === true,
  );
}

function getMaterialTypeLabel(type: MaterialListItem["type"]): string {
  if (type === "pasted_text") {
    return "Pasted text";
  }

  return type.toUpperCase();
}

function buildSessionTitle(material: RagChatMaterial | undefined): string {
  if (!material) {
    return "New note chat";
  }

  return `${material.title} chat`;
}

function sortSessions(sessions: ChatSessionListItem[]): ChatSessionListItem[] {
  return [...sessions].sort(
    (first, second) =>
      new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime(),
  );
}

function SourceCards({ sources }: { sources: RagSourceSnippet[] }) {
  const visibleSources = sources.slice(0, 4);

  if (visibleSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {visibleSources.map((source) => (
        <article
          className="rounded-lg border-2 border-black bg-paper-base p-3 text-sm shadow-brutal-sm"
          key={source.chunk_id}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Badge variant="blue">Chunk {source.chunk_index + 1}</Badge>
            <span className="text-xs font-black text-zinc-600">
              Match {Math.round(source.similarity * 100)}%
            </span>
          </div>
          <p className="font-semibold leading-6">{source.snippet}</p>
        </article>
      ))}
      {sources.length > visibleSources.length ? (
        <p className="rounded-lg border-2 border-dashed border-black bg-paper-base p-3 text-sm font-black leading-6">
          {sources.length - visibleSources.length} more source chunks supported this answer.
        </p>
      ) : null}
    </div>
  );
}

function MessageCard({
  message,
  sources,
}: {
  message: ChatMessageView;
  sources: RagSourceSnippet[];
}) {
  const isAssistant = message.role === "assistant";
  const insufficient = isAssistant && getMessageInsufficientContext(message);
  const savedSourceCount = message.source_chunk_ids?.length ?? 0;

  return (
    <article
      className={cn(
        "rounded-xl border-2 border-black p-4 shadow-brutal-sm",
        isAssistant ? "bg-accent-blue" : "bg-paper-base",
        insufficient && "bg-accent-yellow",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={isAssistant ? "blue" : "neutral"}>
          {isAssistant ? "Study answer" : "Your question"}
        </Badge>
        {insufficient ? <Badge variant="yellow">Insufficient context</Badge> : null}
      </div>
      <p className="whitespace-pre-wrap text-base font-semibold leading-7">
        {message.content}
      </p>
      {insufficient ? (
        <p className="mt-3 rounded-lg border-2 border-black bg-paper-base p-3 text-sm font-black leading-6 shadow-brutal-sm">
          The answer is limited to what was found in this material. Try a narrower question or index a more complete source.
        </p>
      ) : null}
      {isAssistant ? <SourceCards sources={sources} /> : null}
      {isAssistant && sources.length === 0 && savedSourceCount > 0 ? (
        <p className="mt-4 rounded-lg border-2 border-dashed border-black bg-paper-base p-3 text-sm font-black leading-6">
          Source references saved ({savedSourceCount} chunks). Snippets display for newly generated answers only.
        </p>
      ) : null}
    </article>
  );
}

export function RagChatSection({
  initialMaterialId,
  initialNotice,
  materials,
  sessions,
}: RagChatSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialSelectedMaterialId =
    initialMaterialId && materials.some((material) => material.id === initialMaterialId)
      ? initialMaterialId
      : materials[0]?.id ?? "";
  const [materialRows, setMaterialRows] = useState<RagChatMaterial[]>(materials);
  const [sessionRows, setSessionRows] = useState<ChatSessionListItem[]>(sessions);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    initialSelectedMaterialId,
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [sourcesByMessageId, setSourcesByMessageId] = useState<
    Record<string, RagSourceSnippet[]>
  >({});
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(
    initialNotice ? { title: initialNotice, variant: "warning" } : null,
  );
  const [indexingMaterialId, setIndexingMaterialId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [asking, setAsking] = useState(false);

  const selectedMaterial = useMemo(
    () => materialRows.find((material) => material.id === selectedMaterialId),
    [materialRows, selectedMaterialId],
  );
  const selectedMaterialSessions = useMemo(
    () =>
      sortSessions(
        sessionRows.filter(
          (session) => session.material_id === selectedMaterialId,
        ),
      ),
    [selectedMaterialId, sessionRows],
  );
  const selectedMaterialIndexed = Boolean(
    selectedMaterial && selectedMaterial.chunk_count > 0,
  );

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleMaterialChange(materialId: string) {
    setFeedback(null);
    setQuestion("");
    setSelectedMaterialId(materialId);
    setSelectedSessionId("");
    setMessages([]);
    setSourcesByMessageId({});
  }

  async function handleSelectSession(sessionId: string) {
    setFeedback(null);
    setSelectedSessionId(sessionId);
    setSourcesByMessageId({});
    setLoadingSessionId(sessionId);

    const result = await loadChatSessionMessages(sessionId);

    setLoadingSessionId(null);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      setMessages([]);
      return;
    }

    setMessages(result.data);
  }

  async function handleIndexMaterial() {
    if (!selectedMaterial) {
      return;
    }

    setFeedback(null);
    setIndexingMaterialId(selectedMaterial.id);

    const result = await indexMaterialForRag(selectedMaterial.id);

    setIndexingMaterialId(null);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return;
    }

    setMaterialRows((currentRows) =>
      currentRows.map((material) =>
        material.id === result.data.material_id
          ? { ...material, chunk_count: result.data.chunk_count }
          : material,
      ),
    );
    setFeedback({
      variant: "success",
      title: "Material indexed for chat.",
      description: `${result.data.chunk_count} source chunks are ready for grounded answers.`,
    });
    refreshRoute();
  }

  async function handleCreateSession(): Promise<ChatSessionListItem | null> {
    if (!selectedMaterial) {
      return null;
    }

    const activeSession = selectedMaterialSessions.find(
      (session) => session.id === selectedSessionId,
    );

    if (activeSession && messages.length === 0 && !loadingSessionId) {
      setFeedback({
        variant: "info",
        title: "This chat is already empty.",
        description: "Ask the first question here before starting another session.",
      });
      return activeSession;
    }

    if (!selectedSessionId && selectedMaterialSessions.length > 0) {
      const latestSession = selectedMaterialSessions[0];
      await handleSelectSession(latestSession.id);
      setFeedback({
        variant: "info",
        title: "Opened the latest chat for this material.",
        description: "Use New chat again after selecting a session with messages.",
      });
      return latestSession;
    }

    setFeedback(null);
    setCreatingSession(true);

    const result = await createChatSession({
      materialId: selectedMaterial.id,
      title: buildSessionTitle(selectedMaterial),
    });

    setCreatingSession(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return null;
    }

    setSessionRows((currentRows) => [result.data, ...currentRows]);
    setSelectedSessionId(result.data.id);
    setMessages([]);
    setSourcesByMessageId({});
    setFeedback({
      variant: "success",
      title: "Chat session started.",
      description: "Ask a question from this material when you are ready.",
    });
    refreshRoute();
    return result.data;
  }

  async function handleSubmitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedMaterial) {
      setFeedback({ variant: "error", title: "Select a material first." });
      return;
    }

    if (!selectedMaterialIndexed) {
      setFeedback({
        variant: "error",
        title: "Index this material before asking questions.",
      });
      return;
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setFeedback({ variant: "error", title: "Please enter a question first." });
      return;
    }

    setFeedback(null);
    setAsking(true);

    let activeSessionId = selectedSessionId;

    if (!activeSessionId) {
      const created = await handleCreateSession();
      activeSessionId = created?.id ?? "";
    }

    if (!activeSessionId) {
      setAsking(false);
      return;
    }

    const result = await askRagChatQuestion({
      sessionId: activeSessionId,
      materialId: selectedMaterial.id,
      question: trimmedQuestion,
    });

    setAsking(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      const reload = await loadChatSessionMessages(activeSessionId);
      if (reload.ok) {
        setMessages(reload.data);
      }
      return;
    }

    const now = new Date().toISOString();
    const userMessage: ChatMessageView = {
      id: result.data.user_message_id,
      chat_session_id: activeSessionId,
      role: "user",
      content: trimmedQuestion,
      source_chunk_ids: null,
      metadata: { material_id: selectedMaterial.id },
      created_at: now,
    };
    const assistantMessage: ChatMessageView = {
      id: result.data.assistant_message_id,
      chat_session_id: activeSessionId,
      role: "assistant",
      content: result.data.answer,
      source_chunk_ids: result.data.source_chunk_ids,
      metadata: {
        material_id: selectedMaterial.id,
        insufficient_context: result.data.insufficient_context,
        source_count: result.data.sources.length,
      },
      created_at: now,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setSourcesByMessageId((currentSources) => ({
      ...currentSources,
      [assistantMessage.id]: result.data.sources,
    }));
    setQuestion("");
    setFeedback({
      variant: result.data.insufficient_context ? "warning" : "success",
      title: result.data.insufficient_context
        ? "The notes did not have enough context."
        : "Answer generated from your material.",
    });
    refreshRoute();
  }

  if (materialRows.length === 0) {
    return (
      <EmptyState
        accent="blue"
        description="Upload and process a PDF, TXT, or pasted note before starting a source-grounded chat."
        title="No completed materials ready for chat"
      />
    );
  }

  return (
    <section aria-labelledby="rag-chat-heading" className="grid gap-5">
      <div className="brutal-card overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[minmax(280px,0.42fr)_minmax(0,1fr)]">
          <aside className="grid gap-5 border-b-2 border-black bg-paper-muted p-4 sm:p-5 xl:border-b-0 xl:border-r-2">
            <div>
              <p className="text-xs font-black uppercase text-zinc-500">
                Source-grounded chat
              </p>
              <h2
                className="mt-1 font-heading text-3xl font-black leading-tight"
                id="rag-chat-heading"
              >
                Chat with notes
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6">
                Select one completed material, index it for chat if needed, then keep each conversation in its own session.
              </p>
            </div>

            <Select
              helperText="Only completed materials with extracted text are shown."
              label="Material"
              onChange={(event) => handleMaterialChange(event.target.value)}
              value={selectedMaterialId}
            >
              {materialRows.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.title}
                </option>
              ))}
            </Select>

            {selectedMaterial ? (
              <div className="rounded-xl border-2 border-black bg-paper-base p-4 shadow-brutal-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue">{getMaterialTypeLabel(selectedMaterial.type)}</Badge>
                  <Badge variant={selectedMaterialIndexed ? "success" : "yellow"}>
                    {selectedMaterialIndexed
                      ? `Indexed: ${selectedMaterial.chunk_count} chunks`
                      : "Needs indexing"}
                  </Badge>
                </div>
                <h3 className="mt-3 font-heading text-xl font-black leading-tight">
                  {selectedMaterial.title}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6">
                  {selectedMaterialIndexed
                    ? "This material is ready for source-grounded answers."
                    : "Create source chunks before asking questions from this material."}
                </p>
                {!selectedMaterialIndexed ? (
                  <Button
                    className="mt-4 w-full"
                    disabled={indexingMaterialId === selectedMaterial.id}
                    onClick={handleIndexMaterial}
                    type="button"
                    variant="highlight"
                  >
                    {indexingMaterialId === selectedMaterial.id
                      ? "Indexing material..."
                      : "Index material for chat"}
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading text-xl font-black">Sessions</h3>
                <Button
                  disabled={!selectedMaterial || creatingSession || Boolean(loadingSessionId)}
                  onClick={() => {
                    void handleCreateSession();
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {creatingSession ? "Starting..." : "New chat"}
                </Button>
              </div>

              {selectedMaterialSessions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-black bg-paper-base p-4 text-sm font-black leading-6 shadow-brutal-sm">
                  No sessions for this material yet. Start a new chat to keep questions grouped.
                </div>
              ) : (
                <div className="grid gap-2" aria-label="Chat sessions">
                  {selectedMaterialSessions.map((session) => {
                    const active = session.id === selectedSessionId;
                    return (
                      <button
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "min-h-11 rounded-md border-2 border-black px-3 py-2 text-left text-sm font-black shadow-brutal-sm transition hover:bg-accent-yellow",
                          active ? "bg-accent-yellow" : "bg-paper-base",
                        )}
                        key={session.id}
                        onClick={() => {
                          void handleSelectSession(session.id);
                        }}
                        type="button"
                      >
                        <span className="flex min-w-0 items-center justify-between gap-2">
                          <span className="truncate">{session.title}</span>
                          {active ? (
                            <span className="shrink-0 rounded-sm border-2 border-black bg-paper-base px-2 py-0.5 text-[10px] uppercase">
                              Current
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className="grid min-h-[560px] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 bg-paper-base p-4 sm:p-5">
            <div className="rounded-xl border-2 border-black bg-accent-blue p-4 shadow-brutal-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Study answer desk
                  </p>
                  <h3 className="mt-1 break-words font-heading text-2xl font-black leading-tight">
                    {selectedMaterial?.title ?? "Choose a material"}
                  </h3>
                </div>
                <Badge variant={selectedMaterialIndexed ? "success" : "yellow"}>
                  {selectedMaterialIndexed ? "Ready" : "Index needed"}
                </Badge>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto rounded-xl border-2 border-black bg-paper-muted p-3 shadow-brutal-sm sm:p-4">
              {loadingSessionId ? (
                <div className="rounded-lg border-2 border-black bg-paper-base p-4 text-sm font-black shadow-brutal-sm">
                  Loading messages...
                </div>
              ) : !selectedSessionId ? (
                <EmptyState
                  accent="blue"
                  className="shadow-none"
                  description="Create or select a session to preserve the questions and grounded answers for this material."
                  title="No chat session selected"
                />
              ) : messages.length === 0 ? (
                <EmptyState
                  accent="blue"
                  className="shadow-none"
                  description="Ask a focused question. Answers will use retrieved chunks from the selected material only."
                  title="No messages yet"
                />
              ) : (
                <div className="grid gap-4">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      sources={sourcesByMessageId[message.id] ?? []}
                    />
                  ))}
                  {asking ? (
                    <div className="rounded-xl border-2 border-black bg-accent-yellow p-4 text-sm font-black shadow-brutal-sm">
                      Searching your material and drafting a grounded answer...
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <form className="grid gap-3" onSubmit={handleSubmitQuestion}>
              <Textarea
                disabled={!selectedMaterialIndexed || asking || !selectedMaterial}
                id="rag-question"
                label="Ask from this material"
                maxLength={2000}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: What are the main steps in this topic?"
                value={question}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold leading-6 text-zinc-700">
                  Answers use retrieved chunks only. Source cards appear when the answer is supported.
                </p>
                <Button
                  className="w-full sm:w-auto"
                  disabled={
                    !selectedMaterialIndexed ||
                    !selectedMaterial ||
                    asking ||
                    indexingMaterialId !== null
                  }
                  type="submit"
                  variant="primary"
                >
                  {asking ? "Searching notes..." : "Ask notes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {feedback ? (
        <Toast
          description={feedback.description}
          title={feedback.title}
          variant={feedback.variant}
        />
      ) : null}
      {isPending ? <span className="sr-only">Refreshing chat data</span> : null}
    </section>
  );
}