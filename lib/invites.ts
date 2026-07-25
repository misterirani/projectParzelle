import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Invite } from "@/lib/types";

export async function getInviteByToken(token: string): Promise<Invite | null> {
  if (!token) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return data;
}

export type InviteStatus = "valid" | "invalid" | "used" | "expired";

export function inviteStatus(invite: Invite | null): InviteStatus {
  if (!invite) return "invalid";
  if (invite.used_at) return "used";
  if (new Date(invite.expires_at) < new Date()) return "expired";
  return "valid";
}
