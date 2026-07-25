"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function failRedirect(token: string, message: string): never {
  redirect(
    `/register?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`
  );
}

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!token) redirect("/register?error=" + encodeURIComponent("Ungültiger Einladungslink."));
  if (!displayName || !email || !password) {
    failRedirect(token, "Bitte fülle alle Felder aus.");
  }
  if (password.length < 8) {
    failRedirect(token, "Das Passwort muss mindestens 8 Zeichen lang sein.");
  }
  if (password !== passwordConfirm) {
    failRedirect(token, "Die Passwörter stimmen nicht überein.");
  }

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .maybeSingle();

  if (!invite) {
    failRedirect(token, "Dieser Einladungslink ist ungültig oder wurde bereits verwendet.");
  }
  if (new Date(invite.expires_at) < new Date()) {
    failRedirect(token, "Dieser Einladungslink ist abgelaufen.");
  }
  if (invite.email && invite.email.toLowerCase() !== email) {
    failRedirect(token, "Diese Einladung ist für eine andere E-Mail-Adresse bestimmt.");
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, role: invite.role },
  });

  if (createError || !created.user) {
    failRedirect(
      token,
      createError?.message?.toLowerCase().includes("already")
        ? "Für diese E-Mail-Adresse existiert bereits ein Konto."
        : "Registrierung fehlgeschlagen. Bitte versuche es erneut."
    );
  }

  await admin
    .from("invites")
    .update({ used_at: new Date().toISOString(), used_by: created.user.id })
    .eq("id", invite.id);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect("/login");
  }

  redirect("/kalender");
}
