import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">projectParzelle</h1>
        <p className="text-center text-sm text-zinc-500 mb-6">
          Melde dich mit deinem Konto an
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo ?? "/kalender"} />
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Anmelden
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Du hast noch kein Konto? Du brauchst einen Einladungslink von einem
          Admin.
        </p>
      </div>
    </div>
  );
}
