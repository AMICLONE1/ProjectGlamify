// POST /api/v1/booking/checkin
// Staff-authenticated route. Staff scans the check-in code to mark a booking as visited.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const schema = z.object({
  bookingId: z.string(),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { bookingId, code } = parsed.data;

  const booking = await db.onlineBooking.findFirst({
    where: { id: bookingId, tenantId: auth.tenantId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: "Booking must be confirmed before check-in" },
      { status: 409 }
    );
  }

  if (!booking.checkinCode) {
    return NextResponse.json(
      { error: "Check-in code not generated yet. It is sent on the morning of the appointment." },
      { status: 400 }
    );
  }

  if (code !== booking.checkinCode) {
    return NextResponse.json({ error: "Incorrect check-in code" }, { status: 400 });
  }

  const updated = await db.onlineBooking.update({
    where: { id: bookingId },
    data: {
      status: "visited",
      checkedInAt: new Date(),
      checkinCode: null, // Invalidate code after use
    },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      scheduledAt: true,
      serviceIds: true,
      totalAmount: true,
      checkedInAt: true,
    },
  });

  // TODO: credit loyalty points, trigger review request (BullMQ)

  return NextResponse.json({ checkedIn: true, booking: updated });
}
