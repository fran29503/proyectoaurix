import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

export function createSupabaseClient(): {
  client: SupabaseClient | null;
  missing: string[];
} {
  const { url, anonKey } = getSupabaseEnv();
  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length) {
    return { client: null, missing };
  }

  return {
    client: createClient(url!, anonKey!, {
      auth: { persistSession: false },
    }),
    missing,
  };
}

