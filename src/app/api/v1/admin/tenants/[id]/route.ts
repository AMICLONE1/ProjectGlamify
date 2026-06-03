// GET   /api/v1/admin/tenants/[id] — tenant detail (with users, stats).
// PATCH /api/v1/admin/tenants/[id] — suspend/activate or change plan.
// Super-admin only.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
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

  const data: { settings?: object; plan?: string } = {};

  if (parsed.data.suspended !== undefined) {
    const settings = (tenant.settings as Record<string, unknown> | null) ?? {};
    data.settings = { ...settings, suspended: parsed.data.suspended };
    // Mirror onto the tenant's users so they actually lose access.
    await db.user.updateMany({ where: { tenantId: id }, data: { isActive: !parsed.data.suspended } });
  }
  if (parsed.data.plan) data.plan = parsed.data.plan;

  const updated = await db.tenant.update({ where: { id }, data });
  return ok({
    tenant: { id: updated.id, plan: updated.plan, suspended: Boolean((updated.settings as { suspended?: boolean } | null)?.suspended) },
  });
}
