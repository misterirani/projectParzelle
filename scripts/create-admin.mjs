import { createClient } from "@supabase/supabase-js";

const [, , email, password, ...nameParts] = process.argv;
const displayName = nameParts.join(" ") || email;

if (!email || !password) {
  console.error(
    "Verwendung: npm run create-admin -- <email> <passwort> [anzeigename]"
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen in .env.local gesetzt sein."
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: displayName, role: "admin" },
});

if (error) {
  console.error("Fehler beim Erstellen des Admin-Accounts:", error.message);
  process.exit(1);
}

console.log(`Admin-Account erstellt: ${data.user.email} (${data.user.id})`);
