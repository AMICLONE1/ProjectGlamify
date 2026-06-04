// GET /api/v1/admin/tenants/list — all tenants with summary stats.
// Super-admin only. (POST /api/v1/admin/tenants already exists for creation.)

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const tenants = await db.tenant.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      businessType: true,
      plan: true,
      email: true,
      phone: true,
      createdAt: true,
      settings: true,
      _count: { select: { users: true, clients: true, locations: true } },
    },
  });

  return ok({
    tenants: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      businessType: t.businessType,
      plan: t.plan,
      email: t.email,
      phone: t.phone,
      createdAt: t.createdAt,
      suspended: Boolean((t.settings as { suspended?: boolean } | null)?.suspended),
      billing: ((t.settings as { billing?: object } | null)?.billing) ?? null,
      counts: t._count,
    })),
  });
}
