"use server";

import { revalidatePath } from "next/cache";

import { dashboardRoutes } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreatePastedTextMaterialInput,
  MaterialActionResult,
  MaterialDetail,
} from "@/types/materials";

import { extractTextFromMaterialFile } from "./extraction";
import { buildMaterialStoragePath } from "./file-utils";
import {
  getAuthenticatedMaterialUserId,
  MATERIAL_DETAIL_SELECT,
} from "./queries";
import {
  validateMaterialFile,
  validateMaterialTitle,
  validatePastedTextMaterial,
} from "./validation";

const MATERIALS_BUCKET = "materials";

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function getErrorObject(error: unknown): SupabaseLikeError | null {
  return error && typeof error === "object" ? (error as SupabaseLikeError) : null;
}

function revalidateMaterialViews(materialId?: string) {
  revalidatePath(dashboardRoutes.dashboard);
  revalidatePath(dashboardRoutes.materials);

  if (materialId) {
    revalidatePath(`${dashboardRoutes.materials}/${materialId}`);
  }
}

function logSoftDeleteError(input: {
  step: "auth" | "precheck" | "revalidate" | "unexpected";
  materialId?: string;
  userId?: string;
  error?: unknown;
}) {
  const error = getErrorObject(input.error);

  console.error("[materials:soft-delete:error]", {
    materialId: input.materialId,
    userId: input.userId,
    code: error?.code,
    message: error?.message ?? (input.error ? "Unknown error" : undefined),
    details: error?.details,
    hint: error?.hint,
  });
}

function logPdfUploadError(input: {
  step:
    | "validate"
    | "insert"
    | "storage-upload"
    | "extract"
    | "update-completed"
    | "update-failed"
    | "unexpected";
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: unknown;
}) {
  const error = getErrorObject(input.error);

  console.error("[materials:pdf-upload:error]", {
    step: input.step,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    code: error?.code,
    message: error?.message ?? (input.error ? "Unknown error" : undefined),
    details: error?.details,
    hint: error?.hint,
  });
}

function getStringFormValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getFileFormValue(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File ? value : null;
}

function getTextByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

async function markMaterialFailed(input: {
  materialId: string;
  userId: string;
  error: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("materials")
    .update({
      processing_status: "failed",
      processing_error: input.error,
    })
    .eq("id", input.materialId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    logPdfUploadError({
      step: "update-failed",
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      error,
    });
  }

  revalidateMaterialViews(input.materialId);
}

export async function createPastedTextMaterialAction(
  input: CreatePastedTextMaterialInput,
): Promise<MaterialActionResult<MaterialDetail>> {
  const user = await getAuthenticatedMaterialUserId();

  if (!user.ok) {
    return user;
  }

  const validation = validatePastedTextMaterial(input);

  if (!validation.ok) {
    return validation;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .insert({
      user_id: user.data,
      title: validation.data.title,
      type: "pasted_text",
      storage_path: null,
      original_file_name: null,
      file_size_bytes: getTextByteLength(validation.data.text),
      mime_type: "text/plain",
      extracted_text: validation.data.text,
      processing_status: "completed",
      processing_error: null,
      chunk_count: 0,
    })
    .select(MATERIAL_DETAIL_SELECT)
    .maybeSingle<MaterialDetail>();

  if (error || !data) {
    return {
      ok: false,
      error: "Could not save material. Please try again.",
    };
  }

  revalidateMaterialViews(data.id);

  return {
    ok: true,
    data,
  };
}

export async function createUploadedMaterialAction(
  formData: FormData,
): Promise<MaterialActionResult<MaterialDetail>> {
  try {
    const title = validateMaterialTitle(getStringFormValue(formData, "title"));

    if (!title.ok) {
      logPdfUploadError({ step: "validate", error: new Error(title.error) });
      return title;
    }

    const file = getFileFormValue(formData, "file");
    const fileValidation = validateMaterialFile(file);

    if (!fileValidation.ok) {
      logPdfUploadError({
        step: "validate",
        fileName: file?.name,
        fileSize: file?.size,
        mimeType: file?.type,
        error: new Error(fileValidation.error),
      });
      return fileValidation;
    }

    const user = await getAuthenticatedMaterialUserId();

    if (!user.ok) {
      logPdfUploadError({
        step: "validate",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
        error: new Error(user.error),
      });
      return user;
    }

    const materialId = crypto.randomUUID();
    const storagePath = buildMaterialStoragePath(
      user.data,
      materialId,
      fileValidation.data.originalFileName,
    );
    const supabase = await createSupabaseServerClient();
    const { data: insertedMaterial, error: insertError } = await supabase
      .from("materials")
      .insert({
        id: materialId,
        user_id: user.data,
        title: title.data,
        type: fileValidation.data.type,
        storage_path: storagePath,
        original_file_name: fileValidation.data.originalFileName,
        file_size_bytes: fileValidation.data.fileSizeBytes,
        mime_type: fileValidation.data.mimeType,
        extracted_text: null,
        processing_status: "processing",
        processing_error: null,
        chunk_count: 0,
      })
      .select(MATERIAL_DETAIL_SELECT)
      .maybeSingle<MaterialDetail>();

    if (insertError || !insertedMaterial) {
      logPdfUploadError({
        step: "insert",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
        error: insertError ?? new Error("Inserted material was not returned."),
      });
      return {
        ok: false,
        error: "Could not save material. Please try again.",
      };
    }

    const { error: uploadError } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .upload(storagePath, fileValidation.data.file, {
        contentType: fileValidation.data.mimeType,
        upsert: false,
      });

    if (uploadError) {
      logPdfUploadError({
        step: "storage-upload",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
        error: uploadError,
      });
      await markMaterialFailed({
        materialId,
        userId: user.data,
        error: "Could not upload material. Please try again.",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
      });

      return {
        ok: false,
        error: "Could not upload material. Please try again.",
      };
    }

    const extraction = await extractTextFromMaterialFile(
      fileValidation.data.file,
    );

    if (!extraction.ok) {
      logPdfUploadError({
        step: "extract",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
        error: new Error(extraction.error),
      });
      await markMaterialFailed({
        materialId,
        userId: user.data,
        error: extraction.error,
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
      });

      return extraction;
    }

    const { data: completedMaterial, error: updateError } = await supabase
      .from("materials")
      .update({
        extracted_text: extraction.data.text,
        processing_status: "completed",
        processing_error: null,
      })
      .eq("id", materialId)
      .eq("user_id", user.data)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (updateError || !completedMaterial) {
      logPdfUploadError({
        step: "update-completed",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
        error:
          updateError ??
          new Error("Completed material update did not return a row."),
      });
      await markMaterialFailed({
        materialId,
        userId: user.data,
        error: "Could not save material. Please try again.",
        fileName: fileValidation.data.originalFileName,
        fileSize: fileValidation.data.fileSizeBytes,
        mimeType: fileValidation.data.mimeType,
      });

      return {
        ok: false,
        error: "Could not save material. Please try again.",
      };
    }

    revalidateMaterialViews(materialId);

    return {
      ok: true,
      data: {
        ...insertedMaterial,
        extracted_text: extraction.data.text,
        processing_status: "completed",
        processing_error: null,
      },
    };
  } catch (error) {
    logPdfUploadError({
      step: "unexpected",
      error,
    });
    return {
      ok: false,
      error: "Could not upload material. Please try again.",
    };
  }
}

export async function softDeleteMaterialAction(
  materialId: string,
): Promise<MaterialActionResult<{ id: string }>> {
  const id = materialId.trim();

  if (!id) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  try {
    const user = await getAuthenticatedMaterialUserId();

    if (!user.ok) {
      logSoftDeleteError({
        step: "auth",
        materialId: id,
        error: new Error(user.error),
      });
      return user;
    }

    const supabase = await createSupabaseServerClient();
    const { data: material, error: precheckError } = await supabase
      .from("materials")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.data)
      .is("deleted_at", null)
      .maybeSingle<{ id: string }>();

    if (precheckError) {
      logSoftDeleteError({
        step: "precheck",
        materialId: id,
        userId: user.data,
        error: precheckError,
      });
      return {
        ok: false,
        error: "Material not found.",
      };
    }

    if (!material) {
      return {
        ok: false,
        error: "Material not found.",
      };
    }

    const { data, error } = await supabase.rpc("soft_delete_material", {
      p_material_id: id,
    });

    if (error) {
      console.error("[materials:soft-delete:rpc-error]", {
        materialId: id,
        userId: user.data,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        ok: false,
        error: "Could not save material. Please try again.",
      };
    }

    if (data !== true) {
      return {
        ok: false,
        error: "Material not found.",
      };
    }

    try {
      revalidatePath(dashboardRoutes.materials);
      revalidatePath(dashboardRoutes.dashboard);
    } catch (error) {
      logSoftDeleteError({
        step: "revalidate",
        materialId: id,
        userId: user.data,
        error,
      });
    }

    return {
      ok: true,
      data: { id },
    };
  } catch (error) {
    logSoftDeleteError({
      step: "unexpected",
      materialId: id,
      error,
    });
    return {
      ok: false,
      error: "Could not save material. Please try again.",
    };
  }
}