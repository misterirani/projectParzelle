"use client";

import { useTransition } from "react";
import { toggleParticipation } from "@/app/(protected)/kalender/[id]/actions";

export default function ParticipateButton({
  eventId,
  isParticipating,
}: {
  eventId: string;
  isParticipating: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleParticipation(eventId))}
      className={
        isParticipating
          ? "rounded-md border border-club-navy px-4 py-2 text-sm font-medium text-club-navy hover:bg-zinc-100 disabled:opacity-50"
          : "rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark disabled:opacity-50"
      }
    >
      {isParticipating ? "✓ Ich bin dabei" : "Ich bin dabei"}
    </button>
  );
}
