import Link from "next/link";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/auth/actions";

export default function Navbar({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/kalender" className="text-lg font-bold text-zinc-900">
            projectParzelle
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-600">
            <Link href="/kalender" className="hover:text-zinc-900">
              Kalender
            </Link>
            <Link href="/galerie" className="hover:text-zinc-900">
              Galerie
            </Link>
            {profile.role === "admin" && (
              <Link href="/admin/invites" className="hover:text-zinc-900">
                Einladungen
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">
            {profile.display_name}
            {profile.role === "admin" && (
              <span className="ml-2 rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
                Admin
              </span>
            )}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
