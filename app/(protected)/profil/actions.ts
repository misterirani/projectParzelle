"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export async function updateDisplayName(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!displayName) {
    redirect("/profil?error=" + encodeURIComponent("Bitte gib einen Namen ein."));
  }

  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", profile.id);

  revalidatePath("/", "layout");
  redirect("/profil?success=1");
}
