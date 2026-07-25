"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const BUCKET = "gallery-photos";

export async function uploadPhoto(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) return;
  if (!file.type.startsWith("image/")) return;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${profile.id}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) return;

  await supabase.from("photos").insert({
    storage_path: path,
    caption,
    uploader_id: profile.id,
  });

  revalidatePath("/galerie");
}

export async function deletePhoto(formData: FormData) {
  await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const storagePath = String(formData.get("storage_path") ?? "");
  if (!id || !storagePath) return;

  const { data: deleted } = await supabase
    .from("photos")
    .delete()
    .eq("id", id)
    .select("id");

  if (deleted && deleted.length > 0) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  revalidatePath("/galerie");
}
