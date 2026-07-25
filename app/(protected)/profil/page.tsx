import { requireProfile } from "@/lib/auth";
import { updateDisplayName } from "./actions";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const profile = await requireProfile();
  const { error, success } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-club-navy">Profil</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Gespeichert.
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <p className="mb-4 text-sm text-zinc-500">{profile.email}</p>
        <form action={updateDisplayName} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="display_name">
              Anzeigename
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              defaultValue={profile.display_name}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-club-sky"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark"
          >
            Speichern
          </button>
        </form>
      </div>
    </div>
  );
}
