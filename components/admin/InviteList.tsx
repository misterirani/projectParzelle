"use client";

import { useState } from "react";
import type { Invite } from "@/lib/types";
import { revokeInvite } from "@/app/(protected)/admin/invites/actions";

function statusOf(invite: Invite) {
  if (invite.used_at) return { label: "Verwendet", color: "bg-zinc-200 text-zinc-600" };
  if (new Date(invite.expires_at) < new Date())
    return { label: "Abgelaufen", color: "bg-red-100 text-red-700" };
  return { label: "Offen", color: "bg-green-100 text-green-700" };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function InviteList({
  invites,
  siteUrl,
}: {
  invites: Invite[];
  siteUrl: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const linkFor = (invite: Invite) => `${siteUrl}/register?token=${invite.token}`;

  const copyLink = async (invite: Invite) => {
    await navigator.clipboard.writeText(linkFor(invite));
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId((id) => (id === invite.id ? null : id)), 2000);
  };

  if (invites.length === 0) {
    return <p className="text-sm text-zinc-500">Noch keine Einladungen erstellt.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">E-Mail</th>
            <th className="px-4 py-2">Rolle</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Läuft ab</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => {
            const status = statusOf(invite);
            const link = linkFor(invite);
            const mailBody = encodeURIComponent(
              `Hallo!\n\nHier ist dein Einladungslink für projectParzelle:\n${link}\n\nDer Link ist bis zum ${formatDate(
                invite.expires_at
              )} gültig.`
            );
            const mailHref = `mailto:${invite.email ?? ""}?subject=${encodeURIComponent(
              "Deine Einladung zu projectParzelle"
            )}&body=${mailBody}`;

            return (
              <tr key={invite.id} className="border-t border-zinc-100">
                <td className="px-4 py-2">{invite.email ?? "—"}</td>
                <td className="px-4 py-2 capitalize">{invite.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(invite.expires_at)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {!invite.used_at && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyLink(invite)}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                        >
                          {copiedId === invite.id ? "Kopiert!" : "Link kopieren"}
                        </button>
                        <a
                          href={mailHref}
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                        >
                          Per E-Mail senden
                        </a>
                        <form action={revokeInvite}>
                          <input type="hidden" name="id" value={invite.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Widerrufen
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
