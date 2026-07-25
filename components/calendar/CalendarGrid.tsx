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

  const days = useMemo(
    () =>
      weeks.flatMap((week) => week.filter((cell): cell is { date: Date } => cell.date !== null)),
    [weeks]
  );

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
      {/* Desktop/Tablet: Monatsraster */}
      <div className="hidden overflow-hidden rounded-lg border border-zinc-200 bg-white sm:block">
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

      {/* Mobile: Tagesliste, damit Titel nicht abgeschnitten werden */}
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white sm:hidden">
        {days.map(({ date }) => {
          const dateStr = toDateStr(date);
          const dayEvents = eventsByDate.get(dateStr) ?? [];
          const dayBirthdays = birthdaysByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isPast = isPastDate(dateStr);
          const weekdayLabel = WEEKDAYS[(date.getDay() + 6) % 7];
          const hasContent = dayEvents.length > 0 || dayBirthdays.length > 0;

          return (
            <div key={dateStr} className="flex gap-3 p-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${
                  isToday ? "bg-club-sky text-white" : "bg-zinc-50 text-zinc-500"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">{weekdayLabel}</span>
                  {!isPast && (
                    <button
                      type="button"
                      onClick={() => setCreateDate(dateStr)}
                      className="text-xs font-medium text-zinc-400 hover:text-club-navy"
                    >
                      + Termin
                    </button>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayBirthdays.map((name) => (
                    <p
                      key={name}
                      className="rounded bg-club-gold/20 px-2 py-1 text-sm text-club-navy"
                    >
                      🎂 {name} hat Geburtstag
                    </p>
                  ))}
                  {dayEvents.map((ev) =>
                    isPast ? (
                      <p key={ev.id} className="rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-400">
                        {ev.event_time ? `${ev.event_time.slice(0, 5)} ` : ""}
                        {ev.title}
                      </p>
                    ) : (
                      <Link
                        key={ev.id}
                        href={`/kalender/${ev.id}`}
                        className="block rounded bg-club-navy px-2 py-1 text-sm text-white hover:bg-club-navy-dark"
                      >
                        {ev.event_time ? `${ev.event_time.slice(0, 5)} ` : ""}
                        {ev.title}
                      </Link>
                    )
                  )}
                  {!hasContent && <p className="text-sm text-zinc-300">—</p>}
                </div>
              </div>
            </div>
          );
        })}
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
