import { getSupabaseAdmin } from "./supabase/admin";
import { extractBearer } from "./auth";
import { cookies } from "next/headers";
import { verifyBypassToken } from "@/app/api/v1/admin/bypass/route";

// Platform super-admin gate (Clitell staff, not tenant users).
//
// An admin is any authenticated Supabase user whose email is in ADMIN_EMAILS
// (comma-separated). This is orthogonal to the per-tenant UserRole — a platform
// admin need not have a tenant User row at all.
//
//   ADMIN_EMAILS="omkarkolhe912@gmail.com,ops@clitell.in"

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/**
 * Verifies the Supabase token and that the user's email is allowlisted.
 * Returns the admin identity or a Response (401/403) to short-circuit the route.
 */
export async function requireAdmin(request: Request): Promise<
  | { email: string; supabaseUid: string }
  | Response
> {
  // Accept bypass cookie (set via /admin-access page)
  const secret = process.env.ADMIN_SECRET ?? "";
  if (secret.length >= 16) {
    const cookieStore = await cookies();
    const raw = cookieStore.get("clitell_admin_bypass")?.value ?? "";
    if (raw && await verifyBypassToken(raw, secret)) {
      return { email: "admin@clitell.in", supabaseUid: "bypass" };
    }
  }

  const token = extractBearer(request);
  if (!token) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
      { status: 401 }
    );
  }

  if (!isAdminEmail(data.user.email)) {
    return Response.json(
      { success: false, error: { code: "FORBIDDEN", message: "Not a platform admin" } },
      { status: 403 }
    );
  }

  return { email: data.user.email!, supabaseUid: data.user.id };
}
