import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/auth/actions";

export default function Navbar({ profile }: { profile: Profile }) {
  return (
    <header className="border-b-4 border-club-gold bg-club-navy">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/kalender" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Parzelle Eintracht"
              width={36}
              height={36}
              className="rounded-full ring-2 ring-club-gold"
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Parzelle Eintracht
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-white/70">
            <Link href="/kalender" className="hover:text-club-gold">
              Kalender
            </Link>
            <Link href="/galerie" className="hover:text-club-gold">
              Galerie
            </Link>
            {profile.role === "admin" && (
              <Link href="/admin/invites" className="hover:text-club-gold">
                Einladungen
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80">
            {profile.display_name}
            {profile.role === "admin" && (
              <span className="ml-2 rounded-full bg-club-gold px-2 py-0.5 text-xs font-semibold text-club-navy">
                Admin
              </span>
            )}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
