"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!title || !event_date) return;

  await supabase.from("events").insert({
    title,
    event_date,
    event_time,
    description,
    location,
    created_by: user.id,
  });

  revalidatePath("/kalender");
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!id || !title || !event_date) return;

  await supabase
    .from("events")
    .update({
      title,
      event_date,
      event_time,
      description,
      location,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/kalender");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/kalender");
}
