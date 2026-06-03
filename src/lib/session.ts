"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";

// Unified client-side session helpers. Single source of truth for the access
// token used in Authorization headers across the app.

const TOKEN_KEY = "glm_token";
const USER_KEY = "glm_user";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: string;
  locationId: string | null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? "null"); } catch { return null; }
}

export function setUser(user: SessionUser) {
  if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function signOut() {
  try { await getSupabaseBrowser().auth.signOut(); } catch { /* ignore */ }
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// Refreshes the access token from the live Supabase session (tokens expire ~1h).
// Returns a valid token or null. Call before authenticated API requests.
export async function getFreshToken(): Promise<string | null> {
  try {
    const { data, error } = await getSupabaseBrowser().auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token ?? null;
    if (token) setToken(token);
    return token;
  } catch {
    // Invalid/expired refresh token — clear stale keys so the user can log in fresh.
    if (typeof window !== "undefined") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
    }
    return null;
  }
}
