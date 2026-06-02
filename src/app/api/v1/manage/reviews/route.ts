// GET  /api/v1/manage/reviews  — list all reviews for this storefront
// POST /api/v1/manage/reviews  — manually add a review

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const createSchema = z.object({
  authorName: z.string().min(1).max(80),
  rating:     z.number().int().min(1).max(5),
  text:       z.string().min(5).max(1000),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verified:   z.boolean().optional(),
});

async function getSfId(tenantId: string) {
  const sf = await db.storefront.findUnique({ where: { tenantId }, select: { id: true } });
  return sf?.id ?? null;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sfId = await getSfId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const reviews = await db.storefrontReview.findMany({
    where: { storefrontId: sfId },
    orderBy: { createdAt: "desc" },
  });

  return ok({ reviews });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid review data", 422);

  const sfId = await getSfId(auth.tenantId);
  if (!sfId) return fail("NOT_FOUND", "Storefront not found", 404);

  const review = await db.storefrontReview.create({
    data: {
      storefrontId: sfId,
      authorName:   parsed.data.authorName,
      rating:       parsed.data.rating,
      text:         parsed.data.text,
      date:         parsed.data.date ?? new Date().toISOString().split("T")[0],
      verified:     parsed.data.verified ?? false,
      source:       "manual",
    },
  });

  return ok({ review }, 201);
}
