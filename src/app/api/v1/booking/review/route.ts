// POST /api/v1/booking/review
// Staff-authenticated. Sends a WhatsApp review request after a visit.
// Fired after check-in or manually from the dashboard.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  bookingId: z.string(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bookingId required" }, { status: 422 });
  }

  const { bookingId } = parsed.data;

  const booking = await db.onlineBooking.findFirst({
    where: { id: bookingId, tenantId: auth.tenantId },
    include: {
      storefront: {
        include: { tenant: true },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (!["visited", "confirmed", "completed"].includes(booking.status)) {
    return NextResponse.json({ error: "Booking must be visited/completed to request a review" }, { status: 409 });
  }

  const salonName = booking.storefront.tenant.name;
  const sf = booking.storefront;

  // Build the review link — Google Maps if slug available, else storefront page
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://glamify.in"}/${sf.city}/${sf.slug}`;

  await sendWhatsApp({
    type: "review_request",
    phone: booking.customerPhone,
    customerName: booking.customerName,
    salonName,
    reviewLink,
  });

  return NextResponse.json({ sent: true, bookingId });
}
