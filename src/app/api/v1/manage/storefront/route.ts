// GET  /api/v1/manage/storefront  — full storefront data for the dashboard editor
// PATCH /api/v1/manage/storefront — update profile fields (name, area, tagline, description, hours, phone, address)

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocode";

const patchSchema = z.object({
  tagline:     z.string().max(160).optional(),
  description: z.string().max(600).optional(),
  area:        z.string().min(2).max(80).optional(),
  phone:       z.string().max(20).optional(),
  address:     z.string().max(200).optional(),
  geoLat:      z.number().optional(),
  geoLng:      z.number().optional(),
  // Manual Google Maps link. Empty string clears it. Must be a Google/maps URL.
  mapsUrl:     z.string().max(2000).optional().refine(
    (v) => v === undefined || v === "" || /^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+)/i.test(v),
    { message: "Enter a valid Google Maps link" }
  ),
  isPublished: z.boolean().optional(),
}).strict();

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sf = await db.storefront.findUnique({
    where: { tenantId: auth.tenantId },
    include: {
      photos:  { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      tenant: {
        include: {
          locations: { take: 1 },
          services: {
            where: { isActive: true },
            include: { category: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!sf) return fail("NOT_FOUND", "Storefront not found. Complete onboarding first.", 404);

  return ok({ storefront: sf });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body: unknown;
  try { body = await req.json(); } catch { return fail("INVALID_JSON", "Body must be JSON", 400); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Invalid input", 422);

  const { tagline, description, area, phone, address, geoLat, geoLng, mapsUrl, isPublished } = parsed.data;

  const sf = await db.storefront.findUnique({ where: { tenantId: auth.tenantId } });
  if (!sf) return fail("NOT_FOUND", "Storefront not found", 404);

  const updated = await db.storefront.update({
    where: { id: sf.id },
    data: {
      ...(tagline     !== undefined ? { tagline }     : {}),
      ...(description !== undefined ? { description } : {}),
      ...(area        !== undefined ? { area: area.toLowerCase().replace(/\s+/g, "-") } : {}),
      ...(geoLat      !== undefined ? { geoLat }      : {}),
      ...(geoLng      !== undefined ? { geoLng }      : {}),
      ...(mapsUrl     !== undefined ? { mapsUrl: mapsUrl.trim() || null } : {}),
      ...(isPublished !== undefined ? { isPublished, publishedAt: isPublished ? new Date() : null } : {}),
      updatedAt: new Date(),
    },
  });

  // Update location phone/address if provided
  if (phone !== undefined || address !== undefined) {
    const loc = await db.location.findFirst({ where: { tenantId: auth.tenantId } });
    if (loc) {
      await db.location.update({
        where: { id: loc.id },
        data: {
          ...(phone   !== undefined ? { phone }   : {}),
          ...(address !== undefined ? { address } : {}),
        },
      });
    }
  }

  // Keep shared fields in sync with the Settings page:
  //   Storefront.description ↔ Tenant.about   |   Location.phone ↔ Tenant.phone
  if (description !== undefined || phone !== undefined) {
    await db.tenant.update({
      where: { id: auth.tenantId },
      data: {
        ...(description !== undefined ? { about: description } : {}),
        ...(phone       !== undefined ? { phone }              : {}),
      },
    });
  }

  // Auto-geocode when the address or area changed and the client didn't supply
  // explicit coordinates. Best-effort — never blocks the save.
  if ((address !== undefined || area !== undefined) && geoLat === undefined && geoLng === undefined) {
    const loc = await db.location.findFirst({ where: { tenantId: auth.tenantId }, select: { address: true, city: true } });
    const geo = await geocodeAddress({ address: loc?.address, area: updated.area, city: loc?.city });
    if (geo) {
      await db.storefront.update({ where: { id: sf.id }, data: { geoLat: geo.lat, geoLng: geo.lng } });
    }
  }

  // Trigger ISR revalidation
  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (secret && updated.isPublished) {
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003");
    fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, city: updated.city, slug: updated.slug }),
    }).catch(() => {});
  }

  return ok({ storefront: updated });
}
