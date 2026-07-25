"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhoto } from "@/app/(protected)/galerie/actions";

export default function UploadForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Bitte wähle ein Bild aus.");
      return;
    }
    startTransition(async () => {
      await uploadPhoto(formData);
      formRef.current?.reset();
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
    >
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="file">
          Foto hochladen
        </label>
        <input id="file" name="file" type="file" accept="image/*" required className="w-full text-sm" />
      </div>
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="caption">
          Bildunterschrift (optional)
        </label>
        <input
          id="caption"
          name="caption"
          type="text"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club-sky"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-club-navy px-4 py-2 text-sm font-medium text-white hover:bg-club-navy-dark disabled:opacity-50"
      >
        {isPending ? "Wird hochgeladen…" : "Hochladen"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
