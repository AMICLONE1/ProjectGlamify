import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ReviewFlow } from "@/components/storefront/ReviewFlow";

export const dynamic = "force-dynamic"; // always fresh; this is an action page, not indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Params = { city: string; slug: string };

export default async function ReviewPage({ params }: { params: Promise<Params> }) {
  const { city, slug } = await params;

  const sf = await db.storefront.findFirst({
    where: { city, slug, isPublished: true },
    select: { city: true, slug: true, googleReviewUrl: true, tenant: { select: { name: true } } },
  });
  if (!sf) notFound();

  return (
    <ReviewFlow
      city={sf.city}
      slug={sf.slug}
      salonName={sf.tenant.name}
      hasGoogle={!!sf.googleReviewUrl}
    />
  );
}
