"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Profile } from "@/lib/types";
import { signOut } from "@/app/auth/actions";

export default function Navbar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/kalender", label: "Kalender" },
    { href: "/galerie", label: "Galerie" },
    ...(profile.role === "admin"
      ? [{ href: "/admin/invites", label: "Einladungen" }]
      : []),
  ];

  return (
    <header className="border-b-4 border-club-gold bg-club-navy">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/kalender" className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt="Parzelle Eintracht"
            width={36}
            height={36}
            className="shrink-0 rounded-full ring-2 ring-club-gold"
          />
          <span className="truncate text-lg font-bold tracking-tight text-white">
            Parzelle Eintracht
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-4 text-sm font-medium text-white/70">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-club-gold">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/profil" className="text-sm text-white/80 hover:text-club-gold">
              {profile.display_name}
            </Link>
            {profile.role === "admin" && (
              <span className="rounded-full bg-club-gold px-2 py-0.5 text-xs font-semibold text-club-navy">
                Admin
              </span>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white md:hidden"
          aria-label="Menü"
          aria-expanded={open}
        >
          {open ? (
            <span className="text-xl leading-none">✕</span>
          ) : (
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          )}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-white/80">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-club-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center gap-2 text-sm text-white/80"
            >
              <span className="truncate">{profile.display_name}</span>
              {profile.role === "admin" && (
                <span className="shrink-0 rounded-full bg-club-gold px-2 py-0.5 text-xs font-semibold text-club-navy">
                  Admin
                </span>
              )}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="shrink-0 rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
