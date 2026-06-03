"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client — used for auth (signInWithPassword, signOut, getSession).
// Uses the public anon key; safe to expose to the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client components that just need auth.
let browserClient: ReturnType<typeof createClient> | null = null;
export function getSupabaseBrowser() {
  if (!browserClient) browserClient = createClient();
  return browserClient;
}
