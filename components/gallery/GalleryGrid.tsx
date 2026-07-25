"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";
import { deletePhoto } from "@/app/(protected)/galerie/actions";

type PhotoWithUrl = Photo & { url: string };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GalleryGrid({
  photos,
  currentProfileId,
  isAdmin,
}: {
  photos: PhotoWithUrl[];
  currentProfileId: string;
  isAdmin: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Noch keine Fotos vorhanden. Lade das erste Foto hoch!
      </p>
    );
  }

  const active = activeIndex !== null ? photos[activeIndex] : null;
  const canDelete = (p: PhotoWithUrl) => isAdmin || p.uploader_id === currentProfileId;

  const showPrev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const showNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
          >
            <Image
              src={p.url}
              alt={p.caption ?? "Foto"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative flex w-full max-w-3xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.caption ?? "Foto"}
              className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
            />

            <div className="mt-3 flex w-full items-center justify-between text-sm text-zinc-200">
              <div>
                {active.caption && (
                  <p className="font-medium text-white">{active.caption}</p>
                )}
                <p className="text-zinc-400">
                  {active.uploader?.display_name ?? "Unbekannt"} ·{" "}
                  {formatDate(active.created_at)}
                </p>
              </div>
              {canDelete(active) && (
                <form
                  action={async (formData) => {
                    await deletePhoto(formData);
                    setActiveIndex(null);
                  }}
                >
                  <input type="hidden" name="id" value={active.id} />
                  <input type="hidden" name="storage_path" value={active.storage_path} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-400 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400 hover:text-white"
                  >
                    Löschen
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={showPrev}
                className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
              >
                Schließen
              </button>
              <button
                type="button"
                onClick={showNext}
                className="rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
