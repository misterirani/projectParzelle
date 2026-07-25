"use client";

import { useState, useTransition } from "react";
import type { EventItem } from "@/lib/types";
import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/app/(protected)/kalender/actions";

type DialogState =
  | { mode: "create"; date: string }
  | { mode: "edit"; event: EventItem }
  | { mode: "view"; event: EventItem };

export default function EventDialog({
  state,
  onClose,
}: {
  state: DialogState;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const event = state.mode === "create" ? null : state.event;
  const readOnly = state.mode === "view";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (state.mode === "create") {
        await createEvent(formData);
      } else if (state.mode === "edit") {
        formData.set("id", state.event.id);
        await updateEvent(formData);
      }
      onClose();
    });
  };

  const handleDelete = () => {
    if (state.mode !== "edit") return;
    const formData = new FormData();
    formData.set("id", state.event.id);
    startTransition(async () => {
      await deleteEvent(formData);
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
            {state.mode === "create" && "Neuer Termin"}
            {state.mode === "edit" && "Termin bearbeiten"}
            {state.mode === "view" && "Termin"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-zinc-400 hover:text-zinc-900"
          >
            ✕
          </button>
        </div>

        {readOnly && event ? (
          <div className="space-y-2 text-sm">
            <h3 className="text-base font-semibold text-zinc-900">{event.title}</h3>
            <p className="text-zinc-500">
              {event.event_date}
              {event.event_time ? ` · ${event.event_time.slice(0, 5)} Uhr` : ""}
            </p>
            {event.location && <p className="text-zinc-700">📍 {event.location}</p>}
            {event.description && (
              <p className="whitespace-pre-wrap text-zinc-700">{event.description}</p>
            )}
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Titel
              </label>
              <input
                name="title"
                required
                defaultValue={event?.title ?? ""}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                {state.mode === "edit" &&
                  (confirmDelete ? (
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
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Löschen
                    </button>
                  ))}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {isPending ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
