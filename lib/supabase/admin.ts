import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client mit dem Service-Role-Key. Umgeht RLS vollständig.
 * Darf NIEMALS in Client Components oder öffentlich erreichbarem Code
 * importiert werden - nur in Server Actions / Route Handlers.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
