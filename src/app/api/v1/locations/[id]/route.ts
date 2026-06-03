// PATCH  /api/v1/locations/[id] — update a branch
// DELETE /api/v1/locations/[id] — remove a branch (must keep at least one)

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  pincode: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const updated = await db.location.updateMany({
    where: { id, tenantId: auth.tenantId },
    data: parsed.data,
  });
  if (updated.count === 0) return fail("NOT_FOUND", "Branch not found", 404);

  return ok({ updated: true });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const count = await db.location.count({ where: { tenantId: auth.tenantId } });
  if (count <= 1) return fail("LAST_BRANCH", "You must keep at least one branch", 422);

  const loc = await db.location.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!loc) return fail("NOT_FOUND", "Branch not found", 404);

  await db.location.delete({ where: { id } });
  return ok({ deleted: true, id });
}
