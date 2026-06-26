import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  MaterialActionResult,
  MaterialDetail,
  MaterialListItem,
} from "@/types/materials";

export const MATERIAL_LIST_SELECT =
  "id,title,type,original_file_name,file_size_bytes,mime_type,processing_status,processing_error,chunk_count,created_at,updated_at,deleted_at";

export const MATERIAL_DETAIL_SELECT =
  "id,title,type,storage_path,original_file_name,file_size_bytes,mime_type,extracted_text,processing_status,processing_error,chunk_count,created_at,updated_at,deleted_at";

export async function getAuthenticatedMaterialUserId(): Promise<
  MaterialActionResult<string>
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

export async function listMaterials(): Promise<
  MaterialActionResult<MaterialListItem[]>
> {
  const user = await getAuthenticatedMaterialUserId();

  if (!user.ok) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_LIST_SELECT)
    .eq("user_id", user.data)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<MaterialListItem[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load materials.",
    };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function getMaterialDetail(
  materialId: string,
): Promise<MaterialActionResult<MaterialDetail>> {
  const id = materialId.trim();

  if (!id) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  const user = await getAuthenticatedMaterialUserId();

  if (!user.ok) {
    return user;
  }

  return getOwnedMaterialDetail(id, user.data);
}

export async function getRecentMaterials(
  limit = 3,
): Promise<MaterialActionResult<MaterialListItem[]>> {
  const user = await getAuthenticatedMaterialUserId();

  if (!user.ok) {
    return user;
  }

  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 10));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_LIST_SELECT)
    .eq("user_id", user.data)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(safeLimit)
    .returns<MaterialListItem[]>();

  if (error) {
    return {
      ok: false,
      error: "Could not load materials.",
    };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function getOwnedMaterialDetail(
  materialId: string,
  userId: string,
): Promise<MaterialActionResult<MaterialDetail>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_DETAIL_SELECT)
    .eq("id", materialId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle<MaterialDetail>();

  if (error) {
    return {
      ok: false,
      error: "Could not load material.",
    };
  }

  if (!data) {
    return {
      ok: false,
      error: "Material not found.",
    };
  }

  return {
    ok: true,
    data,
  };
}
