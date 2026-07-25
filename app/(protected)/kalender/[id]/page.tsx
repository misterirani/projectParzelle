import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { isPastDate } from "@/lib/dates";
import EventActions from "@/components/calendar/EventActions";
import ParticipateButton from "@/components/calendar/ParticipateButton";
import EventChat from "@/components/calendar/EventChat";
import type { EventItem, EventMessage, EventParticipant, Profile } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, creator:profiles!events_created_by_fkey(*)")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  const typedEvent = event as EventItem & { creator: Profile | null };

  if (isPastDate(typedEvent.event_date)) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-zinc-500">
          Dieser Termin liegt in der Vergangenheit und ist nicht mehr verfügbar.
        </p>
        <Link
          href="/kalender"
          className="mt-4 inline-block text-sm text-club-sky hover:underline"
        >
          ← Zurück zum Kalender
        </Link>
      </div>
    );
  }

  const [{ data: participants }, { data: messages }] = await Promise.all([
    supabase
      .from("event_participants")
      .select("*, profile:profiles!event_participants_user_id_fkey(*)")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("event_messages")
      .select("*, author:profiles!event_messages_author_id_fkey(*)")
      .eq("event_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  const typedParticipants = (participants ?? []) as EventParticipant[];
  const canManage =
    profile.id === typedEvent.created_by || profile.role === "admin";
  const isParticipating = typedParticipants.some((p) => p.user_id === profile.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/kalender" className="text-sm text-club-sky hover:underline">
        ← Zurück zum Kalender
      </Link>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-club-navy">{typedEvent.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {typedEvent.event_date}
              {typedEvent.event_time ? ` · ${typedEvent.event_time.slice(0, 5)} Uhr` : ""}
            </p>
            {typedEvent.location && (
              <p className="mt-1 text-sm text-zinc-700">📍 {typedEvent.location}</p>
            )}
          </div>
          {canManage && <EventActions event={typedEvent} />}
        </div>

        {typedEvent.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
            {typedEvent.description}
          </p>
        )}

        <p className="mt-4 text-xs text-zinc-400">
          Erstellt von {typedEvent.creator?.display_name ?? "Unbekannt"}
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-club-navy">
            {typedParticipants.length} dabei
          </h2>
          <ParticipateButton eventId={id} isParticipating={isParticipating} />
        </div>
        {typedParticipants.length > 0 && (
          <p className="mt-2 text-sm text-zinc-600">
            {typedParticipants
              .map((p) => p.profile?.display_name ?? "Mitglied")
              .join(", ")}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-club-navy">Gruppenchat</h2>
        <EventChat
          eventId={id}
          initialMessages={(messages ?? []) as EventMessage[]}
          currentProfile={profile}
        />
      </div>
    </div>
  );
}
