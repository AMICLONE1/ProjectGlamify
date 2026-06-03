// POST /api/v1/booking/remind
// Staff-authenticated. Sends a WhatsApp reminder for a specific booking.
// Also used by a scheduled job to fire day-before reminders in bulk.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendWhatsApp, formatWaDateTime } from "@/lib/whatsapp";

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
        include: {
          tenant: {
            include: { locations: { take: 1 } },
          },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Only confirmed bookings can be reminded" }, { status: 409 });
  }

  const salonName = booking.storefront.tenant.name;
  const salonPhone = booking.storefront.tenant.locations[0]?.phone ?? "";

  await sendWhatsApp({
    type: "booking_reminder",
    phone: booking.customerPhone,
    customerName: booking.customerName,
    salonName,
    dateTime: formatWaDateTime(booking.scheduledAt),
    salonPhone,
  });

  await db.onlineBooking.update({
    where: { id: bookingId },
    data: { remindedAt: new Date() } as Record<string, unknown>,
  }).catch(() => {});

  return NextResponse.json({ sent: true, bookingId });
}
