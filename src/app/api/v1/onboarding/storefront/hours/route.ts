// POST /api/v1/onboarding/storefront/hours
// Saves opening hours JSON to the storefront record. Auth required.

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const daySchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  closed: z.boolean().optional(),
});

const hoursSchema = z.object({
  hours: z.record(z.string(), daySchema),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = hoursSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid hours data", 422);

  const storefront = await db.storefront.findUnique({ where: { tenantId: auth.tenantId } });
  if (!storefront) return fail("NOT_FOUND", "Create your storefront profile first", 404);

  const updated = await db.storefront.update({
    where: { id: storefront.id },
    data: { openingHours: parsed.data.hours as never, updatedAt: new Date() },
    select: { id: true, openingHours: true },
  });

  return ok({ openingHours: updated.openingHours });
}
