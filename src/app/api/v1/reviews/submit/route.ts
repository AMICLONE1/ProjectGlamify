// POST /api/v1/reviews/submit — public review submission from a storefront.
// No auth (customer-facing). Rate-limited to curb spam.
// 4-5★  → stored as a public review + caller is told to send them to Google.
// 1-3★  → stored as private feedback (verified=false, source="feedback") so it
//         never shows publicly but the salon still sees it.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { GOOGLE_FUNNEL_MIN_STARS } from "@/content/review-phrases";

const schema = z.object({
  city: z.string().min(1),
  slug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().min(1).max(60),
  text: z.string().trim().max(600).optional().or(z.literal("")),
});

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // 5 reviews per IP per hour — enough for a family, blocks spam.
  const ip = getClientIp(req);
  const rl = await rateLimit(`review:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 422 });
  }
  const { city, slug, rating, authorName, text } = parsed.data;

  const sf = await db.storefront.findFirst({
    where: { city, slug, isPublished: true },
    select: { id: true, tenantId: true, googleReviewUrl: true },
  });
  if (!sf) return NextResponse.json({ error: "Storefront not found" }, { status: 404 });

  const isPublic = rating >= GOOGLE_FUNNEL_MIN_STARS;

  await db.storefrontReview.create({
    data: {
      storefrontId: sf.id,
      authorName,
      rating,
      text: text || "",
      date: new Date().toISOString().slice(0, 10),
      verified: isPublic,                       // only happy reviews are publicly verified
      source: isPublic ? "manual" : "feedback", // 1-3★ kept as private feedback
    },
  });

  // Revalidate the public page so a new public review shows up.
  if (isPublic) {
    const { revalidateStorefront } = await import("@/lib/revalidate-storefront");
    await revalidateStorefront(sf.tenantId);
  }

  return NextResponse.json({
    saved: true,
    // Send happy customers to Google to boost the rating that ranks "near me".
    redirectToGoogle: isPublic ? (sf.googleReviewUrl || null) : null,
  });
}
