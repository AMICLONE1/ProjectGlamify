"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFreshToken } from "@/lib/session";

// Client-side gate for the /admin area. Verifies the logged-in user is a platform
// admin by calling a lightweight admin endpoint (server does the real allowlist
// check). Server routes are independently protected by requireAdmin — this is just
// for UX (redirect non-admins instead of showing a broken shell).

type State = "checking" | "ok" | "denied";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getFreshToken();
      if (!token) {
        if (!cancelled) { setState("denied"); router.replace("/login?next=/admin"); }
        return;
      }
      const res = await fetch("/api/v1/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;
      if (res.ok) setState("ok");
      else { setState("denied"); router.replace("/login?next=/admin"); }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
          Verifying access…
        </div>
      </div>
    );
  }
  if (state === "denied") return null;
  return <>{children}</>;
}
