// POST /api/v1/onboarding/storefront/publish
// Sets the storefront as published. Requires at least 1 service.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const storefront = await db.storefront.findUnique({ where: { tenantId: auth.tenantId } });
  if (!storefront) return fail("NOT_FOUND", "Create your storefront profile first", 404);

  const serviceCount = await db.service.count({ where: { tenantId: auth.tenantId, isActive: true } });
  if (serviceCount === 0) return fail("INCOMPLETE", "Add at least one service before publishing", 422);

  const updated = await db.storefront.update({
    where: { id: storefront.id },
    data: { isPublished: true, publishedAt: new Date() },
  });

  // Trigger ISR revalidation — use VERCEL_URL in production, fallback to APP_URL
  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (secret) {
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003");
    await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, city: updated.city, slug: updated.slug }),
    }).catch(() => {});
  }

  return ok({ published: true, storefrontUrl: `/${updated.city}/${updated.slug}`, storefront: updated });
}
