// GET /api/v1/booking/recent  — last 20 online bookings for the authenticated tenant

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const bookings = await db.onlineBooking.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      scheduledAt: true,
      status: true,
      totalAmount: true,
      serviceIds: true,
      durationMins: true,
      confirmedAt: true,
      checkedInAt: true,
      staffDetail: { select: { user: { select: { fullName: true } } } },
    },
  });

  return ok({ bookings });
}
