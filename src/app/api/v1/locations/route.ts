// GET  /api/v1/locations — list tenant branches with staff counts
// POST /api/v1/locations — add a branch

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  pincode: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const locations = await db.location.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { staff: true } } },
  });

  return ok({
    locations: locations.map((l) => ({
      id: l.id, name: l.name, address: l.address, city: l.city,
      pincode: l.pincode, phone: l.phone, isActive: l.isActive, staffCount: l._count.staff,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "name is required", 422);

  const location = await db.location.create({
    data: { tenantId: auth.tenantId, ...parsed.data, isActive: true },
  });

  return ok({ location }, 201);
}
