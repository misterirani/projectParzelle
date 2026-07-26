"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const BUCKET = "gallery-photos";
const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9 MB, unter dem 10-MB-Serverlimit

export async function uploadPhoto(
  formData: FormData
): Promise<{ error?: string } | void> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bitte wähle ein Bild aus." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Nur Bilddateien können hochgeladen werden." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Das Foto ist zu groß (max. 9 MB). Bitte wähle ein kleineres Bild." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${profile.id}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: `Upload fehlgeschlagen: ${uploadError.message}` };
  }

  const { error: insertError } = await supabase.from("photos").insert({
    storage_path: path,
    caption,
    uploader_id: profile.id,
  });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: `Speichern fehlgeschlagen: ${insertError.message}` };
  }

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
