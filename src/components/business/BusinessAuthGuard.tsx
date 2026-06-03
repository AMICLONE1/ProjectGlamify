"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { setToken, setUser } from "@/lib/session";

// Client-side gate for all /business/* pages. Verifies a live Supabase session,
// hydrates the tenant-scoped user, and redirects to /login when unauthenticated.
export function BusinessAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    let active = true;

    (async () => {
      const supabase = getSupabaseBrowser();

      // getSession can throw AuthApiError if the stored refresh token is
      // invalid or expired (e.g. after a server wipe or Supabase project reset).
      // Always catch and redirect cleanly rather than surfacing the error.
      let token: string | null = null;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        token = data.session?.access_token ?? null;
      } catch {
        // Stale / invalid refresh token — clear everything and send to login.
        await supabase.auth.signOut().catch(() => {});
        if (typeof window !== "undefined") {
          // Remove all supabase keys so the next login starts fresh.
          Object.keys(localStorage)
            .filter((k) => k.startsWith("sb-"))
            .forEach((k) => localStorage.removeItem(k));
        }
        if (active) router.replace("/login");
        return;
      }

      if (!token) {
        router.replace("/login");
        return;
      }
      setToken(token);

      // Confirm the user maps to a tenant in our DB; otherwise treat as unauthorized.
      try {
        const res = await fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const me = await res.json().catch(() => null);
        if (!res.ok || !me?.data) {
          await supabase.auth.signOut().catch(() => {});
          router.replace("/login");
          return;
        }
        setUser({
          id: me.data.id,
          fullName: me.data.fullName,
          email: me.data.email,
          role: me.data.role,
          tenantId: me.data.tenantId,
          locationId: me.data.locationId ?? null,
        });
        if (active) setStatus("authed");
      } catch {
        router.replace("/login");
      }
    })();

    return () => { active = false; };
  }, [router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-biz-bg">
        <div className="h-8 w-8 rounded-full border-2 border-biz-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
