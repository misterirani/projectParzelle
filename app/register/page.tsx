import { getInviteByToken, inviteStatus } from "@/lib/invites";
import { acceptInvite } from "./actions";

const STATUS_MESSAGES = {
  invalid: "Dieser Einladungslink ist ungültig.",
  used: "Dieser Einladungslink wurde bereits verwendet.",
  expired: "Dieser Einladungslink ist abgelaufen.",
} as const;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;
  const invite = await getInviteByToken(token);
  const status = inviteStatus(invite);

  if (status !== "valid") {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-2xl font-bold">projectParzelle</h1>
          <p className="text-sm text-red-600">{STATUS_MESSAGES[status]}</p>
          <p className="mt-4 text-sm text-zinc-500">
            Bitte wende dich an einen Admin für einen neuen Einladungslink.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">Willkommen!</h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Erstelle dein Konto für projectParzelle
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={acceptInvite} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="display_name">
              Anzeigename
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={invite?.email ?? ""}
              readOnly={Boolean(invite?.email)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 read-only:bg-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password_confirm">
              Passwort bestätigen
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Konto erstellen
          </button>
        </form>
      </div>
    </div>
  );
}
