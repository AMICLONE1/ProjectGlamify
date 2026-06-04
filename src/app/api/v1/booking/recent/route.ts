// GET /api/v1/booking/recent  — last 20 online bookings for the authenticated tenant

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

const BOOKING_SELECT = {
  id: true, customerName: true, customerPhone: true,
  scheduledAt: true, status: true, totalAmount: true,
  serviceIds: true, durationMins: true, notes: true,
  confirmedAt: true, checkedInAt: true,
  staffDetail: { select: { user: { select: { fullName: true } } } },
} as const;

async function withServiceNames(booking: { serviceIds: string[]; [k: string]: unknown }) {
  if (!booking.serviceIds.length) return { ...booking, services: [] };
  const services = await db.service.findMany({
    where: { id: { in: booking.serviceIds as string[] } },
    select: { id: true, name: true, price: true, durationMinutes: true },
  });
  return { ...booking, services };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const id = new URL(req.url).searchParams.get("id");

  // Single booking by ID
  if (id) {
    const booking = await db.onlineBooking.findFirst({
      where: { id, tenantId: auth.tenantId },
      select: BOOKING_SELECT,
    });
    if (!booking) return Response.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 });
    return ok(await withServiceNames(booking as typeof booking & { serviceIds: string[] }));
  }

  // Recent list
  const bookings = await db.onlineBooking.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: BOOKING_SELECT,
  });

  const withNames = await Promise.all(
    bookings.map((b) => withServiceNames(b as typeof b & { serviceIds: string[] }))
  );

  return ok({ bookings: withNames });
}

// PATCH — update status of a single online booking (e.g. no_show, cancelled)
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const { bookingId, status } = (body as { bookingId?: string; status?: string }) ?? {};
  if (!bookingId || !status) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "bookingId and status required" } }, { status: 422 });
  }

  const allowed = ["no_show", "cancelled", "visited"];
  if (!allowed.includes(status)) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Status must be no_show, cancelled, or visited" } }, { status: 422 });
  }

  const booking = await db.onlineBooking.findFirst({ where: { id: bookingId, tenantId: auth.tenantId } });
  if (!booking) return Response.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 });

  const updated = await db.onlineBooking.update({
    where: { id: bookingId },
    data: {
      status: status as never,
      ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
      ...(status === "visited" ? { checkedInAt: new Date(), checkinCode: null } : {}),
    },
  });

  return ok(updated);
}
