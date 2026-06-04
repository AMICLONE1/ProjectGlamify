// GET   /api/v1/admin/users — users across all tenants (search, filter).
// PATCH /api/v1/admin/users — change role / toggle active.
// POST  /api/v1/admin/users/reset — send a password-reset email (see ./reset).
// Super-admin only.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tenantId = searchParams.get("tenantId") ?? undefined;

  const users = await db.user.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      tenant: { select: { id: true, name: true, slug: true } },
    },
  });

  return ok({ users });
}

const patchSchema = z.object({
  id: z.string(),
  role: z.enum(["owner", "manager", "staff", "receptionist"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join(", "), 422);

  const { id, ...data } = parsed.data;
  const updated = await db.user.update({
    where: { id },
    data,
    select: { id: true, role: true, isActive: true },
  });
  return ok({ user: updated });
}

// DELETE /api/v1/admin/users?id=... — permanently delete a user (DB + Supabase auth).
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return fail("VALIDATION_ERROR", "id is required", 422);

  const user = await db.user.findUnique({ where: { id }, select: { id: true, supabaseUid: true, role: true, tenantId: true } });
  if (!user) return fail("NOT_FOUND", "User not found", 404);

  // Guard: don't allow deleting the last owner of a tenant (would orphan the business).
  if (user.role === "owner") {
    const ownerCount = await db.user.count({ where: { tenantId: user.tenantId, role: "owner" } });
    if (ownerCount <= 1) {
      return fail("LAST_OWNER", "Can't delete the only owner. Delete the whole business instead, or transfer ownership first.", 409);
    }
  }

  // Remove the Supabase auth user first (best-effort), then the DB row.
  if (user.supabaseUid) {
    await getSupabaseAdmin().auth.admin.deleteUser(user.supabaseUid).catch(() => {});
  }
  await db.user.delete({ where: { id } });

  return ok({ deleted: true, id });
}
