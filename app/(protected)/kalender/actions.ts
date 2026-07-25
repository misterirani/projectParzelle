"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { isPastDate } from "@/lib/dates";

export async function createEvent(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!title || !event_date) return;
  if (isPastDate(event_date)) return;

  await supabase.from("events").insert({
    title,
    event_date,
    event_time,
    description,
    location,
    created_by: profile.id,
  });

  revalidatePath("/kalender");
}

export async function updateEvent(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!id || !title || !event_date) return;
  if (isPastDate(event_date)) return;

  const { data: existing } = await supabase
    .from("events")
    .select("created_by, event_date")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return;
  if (isPastDate(existing.event_date)) return;
  if (existing.created_by !== profile.id && profile.role !== "admin") return;

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
  revalidatePath(`/kalender/${id}`);
}

export async function deleteEvent(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: existing } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return;
  if (existing.created_by !== profile.id && profile.role !== "admin") return;

  await supabase.from("events").delete().eq("id", id);

  revalidatePath("/kalender");
  revalidatePath(`/kalender/${id}`);
}
