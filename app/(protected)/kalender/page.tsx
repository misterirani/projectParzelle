import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import type { EventItem } from "@/lib/types";

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const profile = await requireProfile();
  const now = new Date();
  const params = await searchParams;
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  const monthLastDay = new Date(year, month, 0).getDate();
  const startStr = `${year}-${pad(month)}-01`;
  const endStr = `${year}-${pad(month)}-${pad(monthLastDay)}`;

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", startStr)
    .lte("event_date", endStr)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-club-navy">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/kalender?year=${prevYear}&month=${prevMonth}`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            ← Zurück
          </Link>
          <Link
            href={`/kalender?year=${now.getFullYear()}&month=${now.getMonth() + 1}`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Heute
          </Link>
          <Link
            href={`/kalender?year=${nextYear}&month=${nextMonth}`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Weiter →
          </Link>
        </div>
      </div>

      <CalendarGrid
        year={year}
        month={month}
        events={(events ?? []) as EventItem[]}
        isAdmin={profile.role === "admin"}
      />
    </div>
  );
}
