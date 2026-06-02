// GET  /api/v1/onboarding/storefront  — fetch tenant's storefront config (auth required)
// POST /api/v1/onboarding/storefront  — create or update storefront (upsert)
// PUT  /api/v1/onboarding/storefront/publish — set isPublished = true

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

const upsertSchema = z.object({
  area: z.string().min(2).max(80),
  tagline: z.string().max(160).optional(),
  description: z.string().max(600).optional(),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
});

function buildSlug(name: string, city: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) +
    "-" +
    Date.now().toString(36)
  );
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const tenant = await db.tenant.findUnique({
    where: { id: auth.tenantId },
    include: {
      storefront: true,
      locations: { take: 1 },
    },
  });
  if (!tenant) return fail("NOT_FOUND", "Tenant not found", 404);

  return ok({ tenant, storefront: tenant.storefront });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const { area, tagline, description, geoLat, geoLng, address, phone } = parsed.data;

  const tenant = await db.tenant.findUnique({
    where: { id: auth.tenantId },
    select: { id: true, name: true, slug: true, locations: { take: 1, select: { id: true, city: true } } },
  });
  if (!tenant) return fail("NOT_FOUND", "Tenant not found", 404);

  const city = (tenant.locations[0]?.city ?? "india").toLowerCase().replace(/\s+/g, "-");

  // Upsert storefront
  const slug = buildSlug(tenant.name, city);
  const storefront = await db.storefront.upsert({
    where: { tenantId: auth.tenantId },
    create: {
      tenantId: auth.tenantId,
      slug,
      city,
      area: area.toLowerCase().replace(/\s+/g, "-"),
      tagline,
      description,
      geoLat,
      geoLng,
      isPublished: false,
    },
    update: {
      area: area.toLowerCase().replace(/\s+/g, "-"),
      tagline,
      description,
      geoLat,
      geoLng,
      updatedAt: new Date(),
    },
  });

  // Also update location address/phone if provided
  if ((address || phone) && tenant.locations[0]) {
    await db.location.update({
      where: { id: tenant.locations[0].id },
      data: {
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
      },
    });
  }

  return ok({ storefront });
}
