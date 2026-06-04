// GET   /api/v1/admin/tenants/[id] — tenant detail (with users, stats).
// PATCH /api/v1/admin/tenants/[id] — suspend/activate or change plan.
// Super-admin only.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await params;

  const tenant = await db.tenant.findUnique({
    where: { id },
    include: {
      users: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fullName: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      },
      locations: { select: { id: true, name: true, city: true } },
      _count: { select: { clients: true, services: true, products: true, campaigns: true } },
    },
  });
  if (!tenant) return fail("NOT_FOUND", "Tenant not found", 404);

  const [bookings, gmv] = await Promise.all([
    db.onlineBooking.count({ where: { tenantId: id } }),
    db.invoice.aggregate({ where: { tenantId: id, status: "paid" }, _sum: { totalAmt: true } }),
  ]);

  return ok({
    tenant: {
      ...tenant,
      suspended: Boolean((tenant.settings as { suspended?: boolean } | null)?.suspended),
      stats: { bookings, gmv: gmv._sum.totalAmt ?? 0 },
    },
  });
}

const patchSchema = z.object({
  suspended: z.boolean().optional(),
  plan: z.enum(["trial", "starter", "growth", "professional", "enterprise"]).optional(),
  // Manual billing tracking (stored in settings.billing — no DB migration needed)
  billing: z.object({
    status: z.enum(["unpaid", "paid", "overdue"]).optional(),
    paidUntil: z.string().nullable().optional(), // ISO date the access is paid through
    amount: z.number().nullable().optional(),    // last amount collected (₹)
    method: z.string().max(40).nullable().optional(), // "UPI", "Bank transfer", "Cash"...
    note: z.string().max(300).nullable().optional(),
  }).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join(", "), 422);

  const tenant = await db.tenant.findUnique({ where: { id }, select: { settings: true } });
  if (!tenant) return fail("NOT_FOUND", "Tenant not found", 404);

  const existingSettings = (tenant.settings as Record<string, unknown> | null) ?? {};
  const data: { settings?: object; plan?: string } = {};
  let nextSettings = { ...existingSettings };
  let settingsChanged = false;

  if (parsed.data.suspended !== undefined) {
    nextSettings = { ...nextSettings, suspended: parsed.data.suspended };
    settingsChanged = true;
    // Mirror onto the tenant's users so they actually lose access.
    await db.user.updateMany({ where: { tenantId: id }, data: { isActive: !parsed.data.suspended } });
  }

  if (parsed.data.billing) {
    const existingBilling = (existingSettings.billing as Record<string, unknown> | null) ?? {};
    nextSettings = {
      ...nextSettings,
      billing: { ...existingBilling, ...parsed.data.billing, updatedAt: new Date().toISOString() },
    };
    settingsChanged = true;
  }

  if (settingsChanged) data.settings = nextSettings;
  if (parsed.data.plan) data.plan = parsed.data.plan;

  const updated = await db.tenant.update({ where: { id }, data });
  const s = (updated.settings as Record<string, unknown> | null) ?? {};
  return ok({
    tenant: {
      id: updated.id,
      plan: updated.plan,
      suspended: Boolean((s as { suspended?: boolean }).suspended),
      billing: (s.billing as object) ?? null,
    },
  });
}

// DELETE /api/v1/admin/tenants/[id] — permanently delete a business and everything
// under it (users, clients, services, storefront, photos…). Cascades via Prisma.
// Requires ?confirm=<tenant name> to prevent accidental deletion.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;
  const { id } = await params;

  const tenant = await db.tenant.findUnique({
    where: { id },
    select: { id: true, name: true, users: { select: { supabaseUid: true } } },
  });
  if (!tenant) return fail("NOT_FOUND", "Business not found", 404);

  // Safety: caller must echo the exact business name.
  const confirm = new URL(req.url).searchParams.get("confirm");
  if (confirm !== tenant.name) {
    return fail("CONFIRM_REQUIRED", "Confirmation text does not match the business name", 409);
  }

  // Delete all Supabase auth users for this tenant (best-effort).
  const supabase = getSupabaseAdmin();
  await Promise.all(
    tenant.users
      .filter((u) => u.supabaseUid)
      .map((u) => supabase.auth.admin.deleteUser(u.supabaseUid!).catch(() => {}))
  );

  // Delete the tenant — all related rows cascade (onDelete: Cascade on every relation).
  await db.tenant.delete({ where: { id } });

  return ok({ deleted: true, id });
}
