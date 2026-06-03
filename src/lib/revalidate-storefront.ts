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
    if (sf?.isPublished) {
      revalidatePath(`/${sf.city}/${sf.slug}`, "page");
    }
  } catch {
    // Revalidation is best-effort; never block the mutation on it.
  }
}
