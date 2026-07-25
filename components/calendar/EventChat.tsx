"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventMessage, Profile } from "@/lib/types";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventChat({
  eventId,
  initialMessages,
  currentProfile,
}: {
  eventId: string;
  initialMessages: EventMessage[];
  currentProfile: Profile;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const supabaseRef = useRef(createClient());
  const nameCache = useRef(new Map<string, string>());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const m of initialMessages) {
      if (m.author) nameCache.current.set(m.author_id, m.author.display_name);
    }
    nameCache.current.set(currentProfile.id, currentProfile.display_name);
  }, [initialMessages, currentProfile]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`event-messages-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const row = payload.new as EventMessage;

          const cached = nameCache.current.get(row.author_id);
          let displayName: string;
          if (cached) {
            displayName = cached;
          } else {
            const { data } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", row.author_id)
              .single();
            displayName = (data?.display_name as string | undefined) ?? "Mitglied";
            nameCache.current.set(row.author_id, displayName);
          }

          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [...prev, { ...row, author: { display_name: displayName } as Profile }]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || sending) return;
    setText("");
    setSending(true);
    supabaseRef.current
      .from("event_messages")
      .insert({ event_id: eventId, author_id: currentProfile.id, content })
      .then(() => setSending(false));
  };

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 bg-white">
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-400">
            Noch keine Nachrichten. Schreib die erste!
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-semibold text-club-navy">
              {m.author?.display_name ?? "Mitglied"}
            </span>
            <span className="ml-2 text-xs text-zinc-400">
              {formatTime(m.created_at)}
            </span>
            <p className="whitespace-pre-wrap text-zinc-700">{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-200 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={2000}
          placeholder="Nachricht schreiben…"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark disabled:opacity-50"
        >
          Senden
        </button>
      </div>
    </div>
  );
}
