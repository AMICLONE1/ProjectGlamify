// PATCH /api/v1/manage/services/[id]  — update a service
// DELETE /api/v1/manage/services/[id] — soft-delete (set isActive = false)

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const patchSchema = z.object({
  name:            z.string().min(1).max(100).optional(),
  categoryName:    z.string().min(1).max(60).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  price:           z.number().min(0).optional(),
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

  const { name, categoryName, durationMinutes, price, description, isActive } = parsed.data;

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
      ...(description     !== undefined ? { description }     : {}),
      ...(isActive        !== undefined ? { isActive }        : {}),
    },
    include: { category: true },
  });

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

  return ok({ deleted: true, id });
}
