import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Revalidates a tenant's public storefront page after a content change
// (photos, services, reviews, profile). Safe to call from any API route —
// no-ops if the tenant has no published storefront.
export async function revalidateStorefront(tenantId: string): Promise<void> {
  try {
    const sf = await db.storefront.findUnique({
      where: { tenantId },
      select: { city: true, slug: true, isPublished: true },
    });
    if (!sf?.isPublished) return;

    // 1. In-process revalidation (works for same-instance SSR cache)
    revalidatePath(`/${sf.city}/${sf.slug}`, "page");

    // 2. External revalidation via the /api/revalidate endpoint —
    //    busts the Vercel CDN edge cache which revalidatePath alone may miss.
    const secret = process.env.NEXT_REVALIDATE_SECRET;
    if (secret) {
      const base = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003");
      fetch(`${base}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, city: sf.city, slug: sf.slug }),
      }).catch(() => {});
    }
  } catch {
    // Revalidation is best-effort; never block the mutation on it.
  }
}
