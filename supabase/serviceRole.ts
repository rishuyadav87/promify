import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

// This client uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely.
// It must NEVER be imported into anything that runs in the browser --
// only server-only files (API routes, Server Actions) that specifically
// need it. Do not add "use client" to any file that imports this.
//
// Why this exists: the YouTube OAuth callback (route.ts) needs to write
// real, verified subscriber counts and oauth_connected=true to the
// creators table. Doing that write with the logged-in user's own session
// (like the rest of the app does) would mean anyone could reproduce the
// same write with a raw client call and fake being "verified" -- RLS and
// triggers can't tell a real OAuth callback apart from a spoofed request
// if both use the same user JWT. This client is the one exception where
// bypassing that distinction is actually necessary and safe, because the
// calling code (route.ts) has already independently verified the data
// came from Google's API before this is ever called.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Check .env.local (and, once deployed, Vercel's Environment " +
        "Variables settings -- .env.local is never uploaded to Vercel, " +
        "so this must be added there separately).",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
