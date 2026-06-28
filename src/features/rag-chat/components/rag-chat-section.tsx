"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";

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
  renameChatSessionAction,
  softDeleteChatSession,
} from "@/lib/rag/actions";
import type {
  ChatMessageView,
  ChatSessionListItem,
} from "@/lib/rag/queries";
import { cn } from "@/lib/utils/cn";
import type { MaterialListItem } from "@/types/materials";

// ─── Types ────────────────────────────────────────────────────────────────────

type RagChatMaterial = Pick<
  MaterialListItem,
  "id" | "title" | "type" | "chunk_count" | "created_at"
>;

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_MATERIALS_VALUE = "__all__";

function getMessageInsufficientContext(message: ChatMessageView): boolean {
  return Boolean(
    message.metadata &&
      typeof message.metadata === "object" &&
      "insufficient_context" in message.metadata &&
      message.metadata.insufficient_context === true,
  );
}

function getMaterialTypeLabel(type: MaterialListItem["type"]): string {
  if (type === "pasted_text") return "Pasted text";
  return type.toUpperCase();
}

function buildSessionTitle(material: RagChatMaterial | undefined): string {
  if (!material) return "New chat";
  return `${material.title} chat`;
}

function sortSessions(sessions: ChatSessionListItem[]): ChatSessionListItem[] {
  return [...sessions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

// ─── MessageCard ─────────────────────────────────────────────────────────────

function MessageCard({
  message,
}: {
  message: ChatMessageView;
}) {
  const isAssistant = message.role === "assistant";
  const insufficient = isAssistant && getMessageInsufficientContext(message);

  // Render answer with basic markdown: ## headings and - bullet lists
  function renderAnswer(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    function flushList(key: string) {
      if (listItems.length === 0) return;
      elements.push(
        <ul className="mt-2 space-y-1 pl-4" key={key}>
          {listItems.map((item, i) => (
            <li className="list-disc text-base font-semibold leading-7" key={i}>
              {item}
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        flushList(`list-${i}`);
        elements.push(
          <p className="mt-3 font-heading text-base font-black leading-tight" key={i}>
            {trimmed.slice(3)}
          </p>,
        );
      } else if (trimmed.startsWith("- ")) {
        listItems.push(trimmed.slice(2));
      } else if (trimmed === "") {
        flushList(`list-${i}`);
      } else {
        flushList(`list-${i}`);
        elements.push(
          <p className="mt-2 text-base font-semibold leading-7" key={i}>
            {trimmed}
          </p>,
        );
      }
    });
    flushList("list-end");
    return <>{elements}</>;
  }

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
          {isAssistant ? "Answer" : "Your question"}
        </Badge>
        {insufficient ? <Badge variant="yellow">Not in your notes</Badge> : null}
      </div>

      {isAssistant ? (
        renderAnswer(message.content)
      ) : (
        <p className="text-base font-semibold leading-7">{message.content}</p>
      )}

      {isAssistant && !insufficient ? (
        <p className="mt-3 text-xs font-black uppercase tracking-wide text-zinc-500">
          ✓ Answer generated from your material
        </p>
      ) : null}

      {insufficient ? (
        <p className="mt-3 rounded-lg border-2 border-black bg-paper-base p-3 text-sm font-black leading-6 shadow-brutal-sm">
          Your notes didn&apos;t have enough on this topic. Try a more specific question or add
          more material.
        </p>
      ) : null}

    </article>
  );
}

// ─── RagChatSection ───────────────────────────────────────────────────────────

export function RagChatSection({
  initialMaterialId,
  initialNotice,
  materials,
  sessions,
}: RagChatSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialSelectedMaterialId =
    initialMaterialId && materials.some((m) => m.id === initialMaterialId)
      ? initialMaterialId
      : materials[0]?.id ?? "";

  const [materialRows, setMaterialRows] = useState<RagChatMaterial[]>(materials);
  const [sessionRows, setSessionRows] = useState<ChatSessionListItem[]>(sessions);
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialSelectedMaterialId);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageView[]>([]);

  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(
    initialNotice ? { title: initialNotice, variant: "warning" } : null,
  );
  const [preparingMaterialId, setPreparingMaterialId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [asking, setAsking] = useState(false);

  // Rename state
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renamePending, setRenamePending] = useState(false);

  // Delete state
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const isAllMaterials = selectedMaterialId === ALL_MATERIALS_VALUE;

  const selectedMaterial = useMemo(
    () => (isAllMaterials ? undefined : materialRows.find((m) => m.id === selectedMaterialId)),
    [materialRows, selectedMaterialId, isAllMaterials],
  );

  const preparedMaterials = useMemo(
    () => materialRows.filter((m) => (m.chunk_count ?? 0) > 0),
    [materialRows],
  );

  const selectedMaterialPrepared = isAllMaterials
    ? preparedMaterials.length > 0
    : Boolean(selectedMaterial && (selectedMaterial.chunk_count ?? 0) > 0);

  const selectedMaterialSessions = useMemo(() => {
    if (isAllMaterials) {
      return sortSessions(sessionRows.filter((s) => !s.material_id));
    }
    return sortSessions(
      sessionRows.filter((s) => s.material_id === selectedMaterialId),
    );
  }, [selectedMaterialId, sessionRows, isAllMaterials]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function refreshRoute() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleMaterialChange(value: string) {
    setFeedback(null);
    setQuestion("");
    setSelectedMaterialId(value);
    setSelectedSessionId("");
    setMessages([]);
  }

  // ── Session actions ────────────────────────────────────────────────────────

  async function handleSelectSession(sessionId: string) {
    setFeedback(null);
    setSelectedSessionId(sessionId);
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

  async function handlePrepareMaterial() {
    if (!selectedMaterial) return;

    setFeedback(null);
    setPreparingMaterialId(selectedMaterial.id);

    const result = await indexMaterialForRag(selectedMaterial.id);
    setPreparingMaterialId(null);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return;
    }

    setMaterialRows((rows) =>
      rows.map((m) =>
        m.id === result.data.material_id
          ? { ...m, chunk_count: result.data.chunk_count }
          : m,
      ),
    );
    setFeedback({
      variant: "success",
      title: "Material is ready to chat!",
      description: `Prepared from ${result.data.chunk_count} sections.`,
    });
    refreshRoute();
  }

  async function handleCreateSession(): Promise<ChatSessionListItem | null> {
    const materialIdForSession = isAllMaterials ? null : selectedMaterial?.id ?? null;

    if (!isAllMaterials && !selectedMaterial) return null;

    const activeSession = selectedMaterialSessions.find(
      (s) => s.id === selectedSessionId,
    );

    if (activeSession && messages.length === 0 && !loadingSessionId) {
      setFeedback({
        variant: "info",
        title: "This chat is already empty.",
        description: "Ask your first question to get started.",
      });
      return activeSession;
    }

    if (!selectedSessionId && selectedMaterialSessions.length > 0) {
      const latest = selectedMaterialSessions[0];
      await handleSelectSession(latest.id);
      setFeedback({
        variant: "info",
        title: "Opened the latest chat.",
        description: "Use New chat again after the session has messages.",
      });
      return latest;
    }

    setFeedback(null);
    setCreatingSession(true);

    const result = await createChatSession({
      materialId: materialIdForSession,
      title: buildSessionTitle(selectedMaterial),
    });

    setCreatingSession(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return null;
    }

    setSessionRows((rows) => [result.data, ...rows]);
    setSelectedSessionId(result.data.id);
    setMessages([]);
    setFeedback({
      variant: "success",
      title: "New chat started.",
      description: "Ask anything from your notes.",
    });
    refreshRoute();
    return result.data;
  }

  // ── Rename ─────────────────────────────────────────────────────────────────

  function startRename(session: ChatSessionListItem) {
    setRenamingSessionId(session.id);
    setRenameValue(session.title);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  }

  function cancelRename() {
    setRenamingSessionId(null);
    setRenameValue("");
  }

  async function commitRename(sessionId: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      cancelRename();
      return;
    }
    setRenamePending(true);
    const result = await renameChatSessionAction({ sessionId, title: trimmed });
    setRenamePending(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      cancelRename();
      return;
    }

    setSessionRows((rows) =>
      rows.map((s) => (s.id === sessionId ? { ...s, title: result.data.title } : s)),
    );
    cancelRename();
    setFeedback({ variant: "success", title: "Session renamed." });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDeleteSession(sessionId: string) {
    setDeletingSessionId(sessionId);
    const result = await softDeleteChatSession(sessionId);
    setDeletingSessionId(null);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      return;
    }

    const remaining = sessionRows.filter((s) => s.id !== sessionId);
    setSessionRows(remaining);

    if (selectedSessionId === sessionId) {
      setSelectedSessionId("");
      setMessages([]);
    }

    setFeedback({ variant: "success", title: "Chat deleted." });
    refreshRoute();
  }

  // ── Ask question ───────────────────────────────────────────────────────────

  async function handleSubmitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAllMaterials && !selectedMaterial) {
      setFeedback({ variant: "error", title: "Select a material first." });
      return;
    }

    if (!selectedMaterialPrepared) {
      setFeedback({
        variant: "error",
        title: isAllMaterials
          ? "No materials are prepared yet. Prepare at least one material first."
          : "Prepare this material for chat first.",
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

    // For "all materials" mode pass null so the server searches ALL user chunks.
    // For single material mode pass the material's ID.
    const effectiveMaterialId: string | null = isAllMaterials
      ? null
      : (selectedMaterial?.id ?? null);

    if (!isAllMaterials && !effectiveMaterialId) {
      setFeedback({ variant: "error", title: "No prepared material available." });
      setAsking(false);
      return;
    }

    const result = await askRagChatQuestion({
      sessionId: activeSessionId,
      materialId: effectiveMaterialId, // null for all-materials, string for single
      question: trimmedQuestion,
    });

    setAsking(false);

    if (!result.ok) {
      setFeedback({ variant: "error", title: result.error });
      const reload = await loadChatSessionMessages(activeSessionId);
      if (reload.ok) setMessages(reload.data);
      return;
    }

    const now = new Date().toISOString();
    const userMessage: ChatMessageView = {
      id: result.data.user_message_id,
      chat_session_id: activeSessionId,
      role: "user",
      content: trimmedQuestion,
      source_chunk_ids: null,
      metadata: { material_id: effectiveMaterialId },
      created_at: now,
    };
    const assistantMessage: ChatMessageView = {
      id: result.data.assistant_message_id,
      chat_session_id: activeSessionId,
      role: "assistant",
      content: result.data.answer,
      source_chunk_ids: result.data.source_chunk_ids,
      metadata: {
        material_id: effectiveMaterialId,
        insufficient_context: result.data.insufficient_context,
      },
      created_at: now,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setQuestion("");
    setFeedback({
      variant: result.data.insufficient_context ? "warning" : "success",
      title: result.data.insufficient_context
        ? "Your notes didn't have enough on this topic."
        : "Answer generated from your material.",
    });
    refreshRoute();
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (materialRows.length === 0) {
    return (
      <EmptyState
        accent="blue"
        description="Upload and process a PDF, TXT, or pasted note first, then come back to chat with it."
        title="No materials ready yet"
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section aria-labelledby="chat-heading" className="grid gap-5">
      <div className="brutal-card overflow-hidden">
        <div className="grid items-start gap-0 xl:grid-cols-[minmax(280px,0.42fr)_minmax(0,1fr)]">

          {/* ── Sidebar ── */}
          <aside className="grid gap-4 self-start border-b-2 border-black bg-paper-muted p-4 sm:p-5 xl:sticky xl:top-0 xl:border-b-0 xl:border-r-2">
            <div>
              <p className="text-xs font-black uppercase text-zinc-500">
                Learn from your notes
              </p>
              <h2
                className="mt-1 font-heading text-3xl font-black leading-tight"
                id="chat-heading"
              >
                Chat with your notes
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6">
                Pick a material, prepare it if needed, then ask questions in a session.
              </p>
            </div>

            {/* Material selector */}
            <Select
              helperText="Only fully processed materials appear here."
              label="Choose material"
              onChange={(e) => handleMaterialChange(e.target.value)}
              value={selectedMaterialId}
            >
              <option value={ALL_MATERIALS_VALUE}>All prepared materials</option>
              {materialRows.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>

            {/* Material status card */}
            {!isAllMaterials && selectedMaterial ? (
              <div className="rounded-xl border-2 border-black bg-paper-base p-3 shadow-brutal-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue">{getMaterialTypeLabel(selectedMaterial.type)}</Badge>
                  <Badge
                    variant={selectedMaterialPrepared ? "success" : "yellow"}
                  >
                    {selectedMaterialPrepared
                      ? "Ready to chat"
                      : "Needs preparation"}
                  </Badge>
                </div>
                <p className="mt-2 truncate text-sm font-black leading-tight">
                  {selectedMaterial.title}
                </p>
                {!selectedMaterialPrepared ? (
                  <>
                    <p className="mt-1 text-xs font-semibold leading-5 text-zinc-600">
                      Prepare this material before asking questions.
                    </p>
                    <Button
                      className="mt-3 w-full"
                      disabled={preparingMaterialId === selectedMaterial.id}
                      onClick={handlePrepareMaterial}
                      type="button"
                      variant="highlight"
                    >
                      {preparingMaterialId === selectedMaterial.id
                        ? "Preparing…"
                        : "Prepare for chat"}
                    </Button>
                  </>
                ) : null}
              </div>
            ) : null}

            {/* All materials status */}
            {isAllMaterials ? (
              <div className="rounded-xl border-2 border-black bg-paper-base p-3 shadow-brutal-sm">
                <Badge variant={preparedMaterials.length > 0 ? "success" : "yellow"}>
                  {preparedMaterials.length > 0
                    ? `${preparedMaterials.length} materials ready`
                    : "No materials prepared yet"}
                </Badge>
                <p className="mt-2 text-xs font-semibold leading-5 text-zinc-600">
                  {preparedMaterials.length > 0
                    ? "Searches across all your prepared materials."
                    : "Prepare at least one material before chatting."}
                </p>
              </div>
            ) : null}

            {/* Sessions */}
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading text-xl font-black">Chats</h3>
                <Button
                  disabled={
                    (!isAllMaterials && !selectedMaterial) ||
                    creatingSession ||
                    Boolean(loadingSessionId)
                  }
                  onClick={() => { void handleCreateSession(); }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {creatingSession ? "Starting…" : "New chat"}
                </Button>
              </div>

              {selectedMaterialSessions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-black bg-paper-base p-3 text-sm font-black leading-6 shadow-brutal-sm">
                  No chats yet. Start a new one to keep your questions grouped.
                </div>
              ) : (
                <div aria-label="Chat sessions" className="grid max-h-64 gap-2 overflow-y-auto">
                  {selectedMaterialSessions.map((session) => {
                    const active = session.id === selectedSessionId;
                    const isRenaming = renamingSessionId === session.id;
                    const isDeleting = deletingSessionId === session.id;

                    return (
                      <div
                        className={cn(
                          "rounded-md border-2 border-black shadow-brutal-sm overflow-hidden",
                          active ? "bg-accent-yellow" : "bg-paper-base",
                        )}
                        key={session.id}
                      >
                        {isRenaming ? (
                          <div className="flex items-center gap-1 p-2">
                            <input
                              className="min-w-0 flex-1 rounded border-2 border-black bg-paper-base px-2 py-1 text-sm font-black focus:outline-none"
                              maxLength={80}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void commitRename(session.id);
                                if (e.key === "Escape") cancelRename();
                              }}
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                            />
                            <button
                              className="shrink-0 rounded border-2 border-black bg-accent-blue px-2 py-1 text-xs font-black"
                              disabled={renamePending}
                              onClick={() => void commitRename(session.id)}
                              type="button"
                            >
                              Save
                            </button>
                            <button
                              className="shrink-0 rounded border-2 border-black bg-paper-base px-2 py-1 text-xs font-black"
                              onClick={cancelRename}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <button
                              aria-current={active ? "true" : undefined}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm font-black transition",
                                active ? "hover:bg-yellow-300" : "hover:bg-accent-yellow",
                              )}
                              onClick={() => { void handleSelectSession(session.id); }}
                              type="button"
                            >
                              <span className="flex min-w-0 items-center justify-between gap-2">
                                <span className="truncate">{session.title}</span>
                                {active ? (
                                  <span className="shrink-0 rounded-sm border border-black bg-black px-1.5 py-0.5 text-[10px] uppercase text-white">
                                    Open
                                  </span>
                                ) : null}
                              </span>
                            </button>
                            <div className="flex items-center gap-1 px-2 pb-1.5">
                              <button
                                className="rounded px-2 py-0.5 text-[11px] font-black text-zinc-600 transition hover:bg-black hover:text-white"
                                onClick={() => startRename(session)}
                                type="button"
                              >
                                Rename
                              </button>
                              <button
                                className="rounded px-2 py-0.5 text-[11px] font-black text-zinc-600 transition hover:bg-red-600 hover:text-white"
                                disabled={isDeleting}
                                onClick={() => { void handleDeleteSession(session.id); }}
                                type="button"
                              >
                                {isDeleting ? "Deleting…" : "Delete"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* ── Main chat area ── */}
          <div className="grid min-h-[560px] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 bg-paper-base p-4 sm:p-5">

            {/* Header */}
            <div className="rounded-xl border-2 border-black bg-accent-blue p-4 shadow-brutal-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Study desk
                  </p>
                  <h3 className="mt-1 break-words font-heading text-2xl font-black leading-tight">
                    {isAllMaterials
                      ? "All prepared materials"
                      : (selectedMaterial?.title ?? "Choose a material")}
                  </h3>
                </div>
                <Badge variant={selectedMaterialPrepared ? "success" : "yellow"}>
                  {selectedMaterialPrepared ? "Ready to chat" : "Not prepared"}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="min-h-0 overflow-y-auto rounded-xl border-2 border-black bg-paper-muted p-3 shadow-brutal-sm sm:p-4">
              {loadingSessionId ? (
                <div className="rounded-lg border-2 border-black bg-paper-base p-4 text-sm font-black shadow-brutal-sm">
                  Loading your chat…
                </div>
              ) : !selectedSessionId ? (
                <EmptyState
                  accent="blue"
                  className="shadow-none"
                  description="Create or select a chat to keep your questions and answers in one place."
                  title="No chat selected"
                />
              ) : messages.length === 0 ? (
                <EmptyState
                  accent="blue"
                  className="shadow-none"
                  description="Ask a question below. Answers will come straight from your notes."
                  title="Ready for your first question"
                />
              ) : (
                <div className="grid gap-4">
                  {messages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                    />
                  ))}
                  {asking ? (
                    <div className="rounded-xl border-2 border-black bg-accent-yellow p-4 text-sm font-black shadow-brutal-sm">
                      Searching your notes and writing an answer…
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Input form */}
            <form className="grid gap-3" onSubmit={handleSubmitQuestion}>
              <Textarea
                disabled={!selectedMaterialPrepared || asking}
                id="rag-question"
                label="Make material easy here"
                maxLength={2000}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything from your notes…"
                value={question}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold leading-6 text-zinc-700">
                  Answers come only from your own material.
                </p>
                <Button
                  className="w-full sm:w-auto"
                  disabled={
                    !selectedMaterialPrepared ||
                    asking ||
                    preparingMaterialId !== null
                  }
                  type="submit"
                  variant="primary"
                >
                  {asking ? "Searching notes…" : "Ask my notes"}
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