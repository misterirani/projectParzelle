import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import UploadForm from "@/components/gallery/UploadForm";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import type { Photo } from "@/lib/types";

const BUCKET = "gallery-photos";

export default async function GaleriePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: photos } = await supabase
    .from("photos")
    .select("*, uploader:profiles!photos_uploader_id_fkey(*)")
    .order("created_at", { ascending: false });

  const photosWithUrls = (photos ?? []).map((p) => ({
    ...p,
    url: supabase.storage.from(BUCKET).getPublicUrl(p.storage_path).data.publicUrl,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-club-navy">Galerie</h1>

      <UploadForm />

      <div className="mt-8">
        <GalleryGrid
          photos={photosWithUrls as (Photo & { url: string })[]}
          currentProfileId={profile.id}
          isAdmin={profile.role === "admin"}
        />
      </div>
    </div>
  );
}
