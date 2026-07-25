"use client";

import { useRef, useTransition } from "react";
import { createInvite } from "@/app/(protected)/admin/invites/actions";

export default function InviteForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createInvite(formData);
      formRef.current?.reset();
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="email">
          E-Mail (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="mitglied@example.com"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="role">
          Rolle
        </label>
        <select
          id="role"
          name="role"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
        >
          <option value="member">Mitglied</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark disabled:opacity-50"
      >
        {isPending ? "Erstelle…" : "Einladungslink erstellen"}
      </button>
    </form>
  );
}
