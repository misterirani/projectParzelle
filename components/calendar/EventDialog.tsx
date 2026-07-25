"use client";

import { useTransition } from "react";
import type { EventItem } from "@/lib/types";
import { createEvent, updateEvent } from "@/app/(protected)/kalender/actions";

type DialogState =
  | { mode: "create"; date: string }
  | { mode: "edit"; event: EventItem };

export default function EventDialog({
  state,
  onClose,
}: {
  state: DialogState;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const event = state.mode === "edit" ? state.event : null;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (state.mode === "create") {
        await createEvent(formData);
      } else {
        formData.set("id", state.event.id);
        await updateEvent(formData);
      }
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            {state.mode === "create" ? "Neuer Termin" : "Termin bearbeiten"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-zinc-400 hover:text-zinc-900"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Titel
            </label>
            <input
              name="title"
              required
              defaultValue={event?.title ?? ""}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Datum
              </label>
              <input
                type="date"
                name="event_date"
                required
                defaultValue={
                  event?.event_date ?? (state.mode === "create" ? state.date : "")
                }
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Uhrzeit
              </label>
              <input
                type="time"
                name="event_time"
                defaultValue={event?.event_time?.slice(0, 5) ?? ""}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Ort
            </label>
            <input
              name="location"
              defaultValue={event?.location ?? ""}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">
              Beschreibung
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={event?.description ?? ""}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark disabled:opacity-50"
            >
              {isPending ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
