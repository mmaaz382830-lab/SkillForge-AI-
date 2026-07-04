"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import {
  createPastedTextMaterialAction,
  createUploadedMaterialAction,
} from "@/lib/materials/actions";
import {
  MATERIAL_MAX_FILE_SIZE_LABEL,
  MATERIAL_MAX_PASTED_TEXT_LENGTH,
  MATERIAL_MAX_TITLE_LENGTH,
} from "@/lib/materials/constants";

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

type PendingAction = "upload" | "paste" | null;

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function MaterialsUploadSection() {
  const router = useRouter();
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const pasteFormRef = useRef<HTMLFormElement>(null);
  const uploadFormId = useId();
  const pasteFormId = useId();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const uploadPending = pendingAction === "upload";
  const pastePending = pendingAction === "paste";

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const title = readFormValue(formData, "title").trim();
    const file = formData.get("file");

    if (!title) {
      setFeedback({
        variant: "error",
        title: "Material title is required.",
      });
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      setFeedback({
        variant: "error",
        title: "File is empty.",
        description: "Choose a PDF or TXT file before uploading.",
      });
      return;
    }

    setPendingAction("upload");
    try {
      const result = await createUploadedMaterialAction(formData);
      
      if (!result.ok) {
        setFeedback({
          variant: "error",
          title: result.error,
          description:
            result.code === "pdf_unreadable"
              ? "Try a text-based PDF or upload notes as TXT."
              : undefined,
        });
        return;
      }

      setFeedback({
        variant: "success",
        title: "Material uploaded.",
        description: `${result.data.title} is ready in your materials list.`,
      });
      uploadFormRef.current?.reset();
      setSelectedFileName(null);
      router.refresh();
    } catch (error) {
      console.error("[materials:upload] Unhandled error:", error);
      setFeedback({
        variant: "error",
        title: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePasteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const title = readFormValue(formData, "title").trim();
    const text = readFormValue(formData, "text").trim();

    if (!title) {
      setFeedback({
        variant: "error",
        title: "Material title is required.",
      });
      return;
    }

    if (!text) {
      setFeedback({
        variant: "error",
        title: "Pasted text is required.",
      });
      return;
    }

    setPendingAction("paste");
    try {
      const result = await createPastedTextMaterialAction({ title, text });
      
      if (!result.ok) {
        setFeedback({
          variant: "error",
          title: result.error,
        });
        return;
      }

      setFeedback({
        variant: "success",
        title: "Pasted text saved.",
        description: `${result.data.title} is ready in your materials list.`,
      });
      pasteFormRef.current?.reset();
      router.refresh();
    } catch (error) {
      console.error("[materials:paste] Unhandled error:", error);
      setFeedback({
        variant: "error",
        title: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section aria-labelledby="materials-upload-heading" className="grid gap-5">
      <div className="brutal-card bg-accent-blue p-5 sm:p-6">
        <p className="text-xs font-black uppercase text-zinc-700">
          Material intake
        </p>
        <h2
          className="mt-1 font-heading text-3xl font-black leading-tight"
          id="materials-upload-heading"
        >
          Add study source material
        </h2>
        <p className="mt-3 max-w-3xl font-semibold leading-7">
          Upload PDF/TXT or paste notes. Processed materials power chat, roadmaps, flashcards, quizzes, and interview practice.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["PDF", "TXT", "Pasted text", `Max ${MATERIAL_MAX_FILE_SIZE_LABEL}`].map(
            (label) => (
              <span
                className="rounded-pill border-2 border-black bg-paper-base px-3 py-1 text-xs font-black uppercase shadow-brutal-sm"
                key={label}
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>

      {feedback ? (
        <Toast
          description={feedback.description}
          title={feedback.title}
          variant={feedback.variant}
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF or TXT</CardTitle>
            <CardDescription>
              Text-based PDFs only for MVP. Scanned or password-protected PDFs
              may fail safely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={handleUploadSubmit}
              ref={uploadFormRef}
            >
              <Input
                disabled={uploadPending}
                id={`${uploadFormId}-title`}
                label="Material title"
                maxLength={MATERIAL_MAX_TITLE_LENGTH}
                name="title"
                placeholder="React hooks chapter notes"
                required
              />

              <label className="grid gap-2 font-bold">
                <span>PDF or TXT file</span>
                <input
                  accept="application/pdf,text/plain,.pdf,.txt"
                  className="min-h-12 rounded-xl border-2 border-dashed border-black bg-paper-base px-3 py-3 text-sm font-black shadow-brutal-sm file:mr-3 file:rounded-md file:border-2 file:border-black file:bg-card-dark file:px-3 file:py-2 file:text-sm file:font-black file:text-paper-base"
                  disabled={uploadPending}
                  name="file"
                  onChange={(event) => {
                    setSelectedFileName(event.currentTarget.files?.[0]?.name ?? null);
                  }}
                  required
                  type="file"
                />
                <span className="text-sm font-semibold leading-6">
                  Choose a PDF or TXT up to {MATERIAL_MAX_FILE_SIZE_LABEL}.
                </span>
              </label>

              <div className="rounded-md border-2 border-black bg-paper-muted px-4 py-3 text-sm font-semibold shadow-brutal-sm">
                {selectedFileName
                  ? `Selected: ${selectedFileName}`
                  : "No file selected yet."}
              </div>

              <Button disabled={uploadPending || pastePending} type="submit">
                {uploadPending ? "Uploading material..." : "Upload Material"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-paper-muted">
          <CardHeader>
            <CardTitle>Create pasted text material</CardTitle>
            <CardDescription>
              Paste notes, copied lesson text, or your own study summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={handlePasteSubmit}
              ref={pasteFormRef}
            >
              <Input
                disabled={pastePending}
                id={`${pasteFormId}-title`}
                label="Material title"
                maxLength={MATERIAL_MAX_TITLE_LENGTH}
                name="title"
                placeholder="Async JavaScript notes"
                required
              />
              <Textarea
                disabled={pastePending}
                helperText="Paste plain text. Empty notes are blocked."
                id={`${pasteFormId}-text`}
                label="Pasted notes"
                maxLength={MATERIAL_MAX_PASTED_TEXT_LENGTH}
                name="text"
                placeholder="Paste your study notes here..."
                required
                rows={9}
              />
              <Button
                disabled={uploadPending || pastePending}
                type="submit"
                variant="highlight"
              >
                {pastePending ? "Saving pasted text..." : "Create Pasted Text Material"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}