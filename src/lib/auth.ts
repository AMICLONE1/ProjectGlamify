import { db } from "./db";
import { getSupabaseAdmin } from "./supabase/admin";

export function extractBearer(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// Verifies the Supabase access token, then maps the Supabase user → our User row
// via User.supabaseUid. Returns the same { userId, tenantId, role } contract that
// all 27 API routes already depend on.
export async function requireAuth(request: Request): Promise<{
  userId: string;
  tenantId: string;
  role: string;
} | Response> {
  const token = extractBearer(request);
  if (!token) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Missing token" } },
      { status: 401 }
    );
  }

  // Verify the JWT against Supabase Auth (GoTrue).
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
      { status: 401 }
    );
  }

  // Map Supabase user → our tenant-scoped User row.
  const user = await db.user.findUnique({
    where: { supabaseUid: data.user.id },
    select: { id: true, tenantId: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Account not found or inactive" } },
      { status: 401 }
    );
  }

  return { userId: user.id, tenantId: user.tenantId, role: user.role };
}

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number): Response {
  return Response.json({ success: false, error: { code, message } }, { status });
}

export async function writeAudit(
  tenantId: string,
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  diff?: unknown
) {
  await db.auditLog.create({
    data: { tenantId, userId, action, resource, resourceId, diff: diff as never },
  });
}
