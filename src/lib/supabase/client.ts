"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client — used for auth (signInWithPassword, signOut, getSession).
// Uses the public anon key; safe to expose to the browser.

const REMEMBER_KEY = "clitell_remember";

/**
 * "Remember me" controls where the Supabase session is persisted:
 *   - remembered (true)  → localStorage: survives browser restarts.
 *   - not remembered     → sessionStorage: cleared when the tab/browser closes.
 * The preference itself is stored in localStorage so we can rebuild the right
 * client on the next page load.
 */
export function getRememberPreference(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(REMEMBER_KEY) !== "false";
}

export function setRememberPreference(remember: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

function pickStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  // Always localStorage: a salon app should keep staff logged in across app
  // closes / phone restarts. They only log out when they explicitly tap Sign out.
  // (The "remember me" toggle now only controls pre-filling the email.)
  return window.localStorage;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: pickStorage(),
        persistSession: true,
        autoRefreshToken: true,
        // Supabase refresh tokens are long-lived and rotate on use, so the
        // session stays valid indefinitely as long as the app is opened
        // periodically — no fixed timeout logout.
      },
    }
  );
}

// Singleton for client components that just need auth.
let browserClient: ReturnType<typeof createClient> | null = null;
export function getSupabaseBrowser() {
  if (!browserClient) browserClient = createClient();
  return browserClient;
}

/**
 * Rebuild the singleton with the current remember preference. Call this right
 * before signing in, after the user has toggled "remember me", so the session
 * lands in the correct storage.
 */
export function resetSupabaseBrowser() {
  browserClient = null;
  return getSupabaseBrowser();
}
