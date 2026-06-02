import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Called by the NestJS API when a salon updates their storefront.
// POST /api/revalidate
// Body: { secret, city, slug }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (!secret || body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { city, slug } = body as { city?: string; slug?: string };
  if (!city || !slug) {
    return NextResponse.json({ error: "city and slug required" }, { status: 400 });
  }

  revalidatePath(`/${city}/${slug}`, "page");

  return NextResponse.json({ revalidated: true, path: `/${city}/${slug}` });
}
