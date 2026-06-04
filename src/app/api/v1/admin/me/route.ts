// GET /api/v1/admin/me — confirms the caller is a platform admin (for the UI guard).
// Accepts either a Supabase Bearer token OR a valid admin-bypass cookie.

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { ok } from "@/lib/auth";
import { verifyBypassToken } from "../bypass/route";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  // Fast path: bypass cookie
  const secret = process.env.ADMIN_SECRET ?? "";
  if (secret.length >= 16) {
    const cookieStore = await cookies();
    const raw = cookieStore.get("clitell_admin_bypass")?.value ?? "";
    if (raw && await verifyBypassToken(raw, secret)) {
      return ok({ email: "admin@clitell.in", bypass: true });
    }
  }

  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  return ok({ email: admin.email });
}
