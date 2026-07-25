"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { isPastDate } from "@/lib/dates";

export async function toggleParticipation(eventId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("event_date")
    .eq("id", eventId)
    .maybeSingle();

  if (!event || isPastDate(event.event_date)) return;

  const { data: existing } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("event_participants").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("event_participants")
      .insert({ event_id: eventId, user_id: profile.id });
  }

  revalidatePath(`/kalender/${eventId}`);
}
