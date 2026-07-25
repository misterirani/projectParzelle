import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import InviteForm from "@/components/admin/InviteForm";
import InviteList from "@/components/admin/InviteList";
import type { Invite } from "@/lib/types";

export default async function InvitesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Einladungen</h1>
      <InviteForm />
      <div className="mt-8">
        <InviteList invites={(invites ?? []) as Invite[]} siteUrl={siteUrl} />
      </div>
    </div>
  );
}
