"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EventDialog from "./EventDialog";
import type { EventItem } from "@/lib/types";
import { deleteEvent } from "@/app/(protected)/kalender/actions";

export default function EventActions({ event }: { event: EventItem }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", event.id);
    startTransition(async () => {
      await deleteEvent(formData);
      router.push("/kalender");
    });
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
      >
        Bearbeiten
      </button>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Sicher?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Ja, löschen
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-zinc-500 hover:underline"
          >
            Abbrechen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Löschen
        </button>
      )}
      {editing && (
        <EventDialog state={{ mode: "edit", event }} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
