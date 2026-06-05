// PATCH /api/v1/manage/services/[id]  — update a service
// DELETE /api/v1/manage/services/[id] — soft-delete (set isActive = false)

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

const patchSchema = z.object({
  name:            z.string().min(1).max(100).optional(),
  categoryName:    z.string().min(1).max(60).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  price:           z.number().finite().min(0).max(1_000_000).optional(),
  priceType:       z.enum(["fixed", "from", "range"]).optional(),
  priceMax:        z.number().finite().min(0).max(1_000_000).nullable().optional(),
  description:     z.string().max(200).nullable().optional(),
  isActive:        z.boolean().optional(),
}).strict();

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const existing = await db.service.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Service not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const { name, categoryName, durationMinutes, price, priceType, priceMax, description, isActive } = parsed.data;

  // Validate range coherence using the effective (new or existing) values.
  const effType = priceType ?? existing.priceType;
  const effPrice = price ?? existing.price;
  const effMax = priceMax !== undefined ? priceMax : existing.priceMax;
  if (effType === "range" && !(effMax != null && effMax > effPrice)) {
    return fail("VALIDATION_ERROR", "For a range, the max price must be greater than the starting price", 422);
  }

  let categoryId = existing.categoryId;
  if (categoryName) {
    let cat = await db.serviceCategory.findFirst({
      where: { tenantId: auth.tenantId, name: { equals: categoryName, mode: "insensitive" } },
    });
    if (!cat) cat = await db.serviceCategory.create({ data: { tenantId: auth.tenantId, name: categoryName } });
    categoryId = cat.id;
  }

  const updated = await db.service.update({
    where: { id },
    data: {
      ...(name            !== undefined ? { name }            : {}),
      ...(categoryId      !== existing.categoryId ? { categoryId } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
      ...(price           !== undefined ? { price }           : {}),
      ...(priceType       !== undefined ? { priceType }       : {}),
      // Clear priceMax whenever the effective type isn't a range.
      ...(priceType !== undefined || priceMax !== undefined
        ? { priceMax: effType === "range" ? effMax : null }
        : {}),
      ...(description     !== undefined ? { description }     : {}),
      ...(isActive        !== undefined ? { isActive }        : {}),
    },
    include: { category: true },
  });

  await revalidateStorefront(auth.tenantId);
  return ok({ service: updated });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;

  const existing = await db.service.findFirst({ where: { id, tenantId: auth.tenantId } });
  if (!existing) return fail("NOT_FOUND", "Service not found", 404);

  // Soft delete — keeps history intact
  await db.service.update({ where: { id }, data: { isActive: false } });

  await revalidateStorefront(auth.tenantId);
  return ok({ deleted: true, id });
}
