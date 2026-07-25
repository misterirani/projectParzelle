"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim() || null;

  if (!displayName) {
    redirect("/profil?error=" + encodeURIComponent("Bitte gib einen Namen ein."));
  }

  await supabase
    .from("profiles")
    .update({ display_name: displayName, birth_date: birthDate })
    .eq("id", profile.id);

  revalidatePath("/", "layout");
  revalidatePath("/kalender");
  redirect("/profil?success=1");
}
