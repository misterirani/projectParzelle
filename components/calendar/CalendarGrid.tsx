"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/types";
import EventDialog from "./EventDialog";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type DialogState =
  | { mode: "create"; date: string }
  | { mode: "edit"; event: EventItem }
  | { mode: "view"; event: EventItem };

function buildWeeks(year: number, month: number) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Montag = 0

  const cells: { date: Date | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month - 1, d) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null });

  const weeks: { date: Date | null }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function CalendarGrid({
  year,
  month,
  events,
  isAdmin,
}: {
  year: number;
  month: number;
  events: EventItem[];
  isAdmin: boolean;
}) {
  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const ev of events) {
      const list = map.get(ev.event_date) ?? [];
      list.push(ev);
      map.set(ev.event_date, list);
    }
    return map;
  }, [events]);

  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const todayStr = toDateStr(new Date());

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flatMap((week, wi) =>
            week.map((cell, di) => {
              const dateStr = cell.date ? toDateStr(cell.date) : null;
              const dayEvents = dateStr ? eventsByDate.get(dateStr) ?? [] : [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`min-h-[100px] border-b border-r border-zinc-100 p-1.5 ${
                    cell.date ? "" : "bg-zinc-50/50"
                  }`}
                >
                  {cell.date && (
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium ${
                          isToday
                            ? "flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      {isAdmin && dateStr && (
                        <button
                          type="button"
                          onClick={() =>
                            setDialogState({ mode: "create", date: dateStr })
                          }
                          className="text-xs text-zinc-400 hover:text-zinc-900"
                          aria-label="Termin hinzufügen"
                        >
                          +
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() =>
                          setDialogState(
                            isAdmin
                              ? { mode: "edit", event: ev }
                              : { mode: "view", event: ev }
                          )
                        }
                        className="block w-full truncate rounded bg-zinc-900/90 px-1.5 py-0.5 text-left text-xs text-white hover:bg-zinc-700"
                        title={ev.title}
                      >
                        {ev.event_time ? `${ev.event_time.slice(0, 5)} ` : ""}
                        {ev.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {dialogState && (
        <EventDialog state={dialogState} onClose={() => setDialogState(null)} />
      )}
    </>
  );
}
