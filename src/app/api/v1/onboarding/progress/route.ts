// GET /api/v1/onboarding/progress — real getting-started checklist state.
// Each flag reflects persisted data so the dashboard checklist ticks off
// automatically as the owner completes setup.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const [tenant, storefront, serviceCount, photoCount, bookingCount, appointmentCount] = await Promise.all([
    db.tenant.findUnique({
      where: { id: auth.tenantId },
      select: { name: true, phone: true, email: true, about: true, openHour: true, closeHour: true },
    }),
    db.storefront.findUnique({
      where: { tenantId: auth.tenantId },
      select: { id: true, isPublished: true, slug: true, city: true },
    }),
    db.service.count({ where: { tenantId: auth.tenantId, isActive: true } }),
    db.storefront.findUnique({ where: { tenantId: auth.tenantId } }).then(async (sf) =>
      sf ? db.storefrontPhoto.count({ where: { storefrontId: sf.id } }) : 0
    ),
    db.onlineBooking.count({ where: { tenantId: auth.tenantId, status: { in: ["confirmed", "visited"] } } }),
    db.appointment.count({ where: { tenantId: auth.tenantId } }),
  ]);

  // Business profile is complete only when the owner has filled the real
  // Settings → Business profile (name, phone, email, about, hours).
  const profileDone = !!tenant && !!(
    tenant.name?.trim() && tenant.phone?.trim() && tenant.email?.trim() &&
    tenant.about?.trim() && tenant.openHour != null && tenant.closeHour != null
  );
  const servicesDone = serviceCount > 0;
  const photosDone = photoCount > 0;
  const publishedDone = !!storefront?.isPublished;
  const bookingDone = bookingCount + appointmentCount > 0;

  return ok({
    storefrontUrl: storefront ? `/${storefront.city}/${storefront.slug}` : null,
    isPublished: !!storefront?.isPublished,
    steps: {
      account: true,
      profile: profileDone,
      services: servicesDone,
      photos: photosDone,
      published: publishedDone,
      booking: bookingDone,
    },
  });
}
