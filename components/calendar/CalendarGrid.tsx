"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { isPastDate, todayDateStr } from "@/lib/dates";
import EventDialog from "./EventDialog";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

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
  birthdays,
}: {
  year: number;
  month: number;
  events: EventItem[];
  birthdays: { date: string; displayName: string }[];
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

  const birthdaysByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const b of birthdays) {
      const list = map.get(b.date) ?? [];
      list.push(b.displayName);
      map.set(b.date, list);
    }
    return map;
  }, [birthdays]);

  const [createDate, setCreateDate] = useState<string | null>(null);
  const todayStr = todayDateStr();

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
              const dayBirthdays = dateStr ? birthdaysByDate.get(dateStr) ?? [] : [];
              const isToday = dateStr === todayStr;
              const isPast = dateStr ? isPastDate(dateStr) : false;

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
                            ? "flex h-5 w-5 items-center justify-center rounded-full bg-club-sky text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      {dateStr && !isPast && (
                        <button
                          type="button"
                          onClick={() => setCreateDate(dateStr)}
                          className="text-xs text-zinc-400 hover:text-club-navy"
                          aria-label="Termin hinzufügen"
                        >
                          +
                        </button>
                      )}
                    </div>
                  )}
                  <div className="mt-1 space-y-1">
                    {dayBirthdays.map((name) => (
                      <span
                        key={name}
                        className="block truncate rounded bg-club-gold/20 px-1.5 py-0.5 text-left text-xs text-club-navy"
                        title={`${name} hat Geburtstag`}
                      >
                        🎂 {name}
                      </span>
                    ))}
                    {dayEvents.map((ev) =>
                      isPast ? (
                        <span
                          key={ev.id}
                          className="block truncate rounded bg-zinc-100 px-1.5 py-0.5 text-left text-xs text-zinc-400"
                          title={ev.title}
                        >
                          {ev.event_time ? `${ev.event_time.slice(0, 5)} ` : ""}
                          {ev.title}
                        </span>
                      ) : (
                        <Link
                          key={ev.id}
                          href={`/kalender/${ev.id}`}
                          className="block truncate rounded bg-club-navy px-1.5 py-0.5 text-left text-xs text-white hover:bg-club-navy-dark"
                          title={ev.title}
                        >
                          {ev.event_time ? `${ev.event_time.slice(0, 5)} ` : ""}
                          {ev.title}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {createDate && (
        <EventDialog
          state={{ mode: "create", date: createDate }}
          onClose={() => setCreateDate(null)}
        />
      )}
    </>
  );
}
