// GET /api/v1/booking/status?id=...
// Public — returns safe booking info so the confirmation page can display it.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const booking = await db.onlineBooking.findUnique({
    where: { id },
    select: {
      id: true,
      customerName: true,
      scheduledAt: true,
      status: true,
      totalAmount: true,
      serviceIds: true,
      durationMins: true,
      confirmedAt: true,
      staffDetail: { select: { user: { select: { fullName: true } } } },
      storefront: {
        select: {
          slug: true,
          city: true,
          area: true,
          tenant: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ booking });
}
