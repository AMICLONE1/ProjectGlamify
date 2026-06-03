// PATCH  /api/v1/manage/reviews/[id]  — edit a review
// DELETE /api/v1/manage/reviews/[id]  — remove a review

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  authorName: z.string().min(1).max(80).optional(),
  rating:     z.number().int().min(1).max(5).optional(),
  text:       z.string().min(5).max(1000).optional(),
  verified:   z.boolean().optional(),
}).strict();

async function getSfId(tenantId: string) {
  const sf = await db.storefront.findUnique({ where: { tenantId }, select: { id: true } });
  return sf?.id ?? null;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const sfId = await getSfId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const review = await db.storefrontReview.findFirst({ where: { id, storefrontId: sfId } });
  if (!review) return fail("NOT_FOUND", "Review not found", 404);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const updated = await db.storefrontReview.update({
    where: { id },
    data: {
      ...(parsed.data.authorName !== undefined ? { authorName: parsed.data.authorName } : {}),
      ...(parsed.data.rating     !== undefined ? { rating:     parsed.data.rating }     : {}),
      ...(parsed.data.text       !== undefined ? { text:       parsed.data.text }       : {}),
      ...(parsed.data.verified   !== undefined ? { verified:   parsed.data.verified }   : {}),
    },
  });

  await revalidateStorefront(auth.tenantId);
  return ok({ review: updated });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const sfId = await getSfId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const review = await db.storefrontReview.findFirst({ where: { id, storefrontId: sfId } });
  if (!review) return fail("NOT_FOUND", "Review not found", 404);

  await db.storefrontReview.delete({ where: { id } });

  await revalidateStorefront(auth.tenantId);
  return ok({ deleted: true, id });
}
