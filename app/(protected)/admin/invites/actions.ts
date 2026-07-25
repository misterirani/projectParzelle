"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createInvite(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const role = formData.get("role") === "admin" ? "admin" : "member";

  await supabase.from("invites").insert({
    email,
    role,
    created_by: admin.id,
  });

  revalidatePath("/admin/invites");
}

export async function revokeInvite(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("invites").delete().eq("id", id);
  revalidatePath("/admin/invites");
}
