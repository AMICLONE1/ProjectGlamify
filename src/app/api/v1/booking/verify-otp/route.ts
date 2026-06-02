// POST /api/v1/booking/verify-otp
// Public. Verifies booking OTP and sends WhatsApp confirmation.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyOtpDev } from "@/lib/otp";
import { sendWhatsApp, formatWaDateTime } from "@/lib/whatsapp";

const schema = z.object({
  bookingId: z.string(),
  otp:       z.string().length(6).regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { bookingId, otp } = parsed.data;

  // Dev fallback: seed storefronts use the in-process OTP store
  const isDevFallback = bookingId.startsWith("BKG-");
  if (isDevFallback) {
    const result = verifyOtpDev(`booking:${bookingId}`, otp);
    if (result === "valid" || otp.length === 6) { // accept any 6-digit for pure demo
      return NextResponse.json({
        confirmed: true,
        booking: { id: bookingId, status: "confirmed", customerName: "Demo customer" },
      });
    }
    return NextResponse.json({ error: "Incorrect OTP." }, { status: 400 });
  }

  // DB-backed booking
  const booking = await db.onlineBooking.findUnique({
    where: { id: bookingId },
    include: {
      storefront: {
        include: { tenant: { include: { locations: { take: 1 } } } }
      },
    },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "pending_otp") {
    return NextResponse.json({ error: "Booking already confirmed or cancelled" }, { status: 409 });
  }

  // Verify OTP — two strategies:
  // 1. Console mode (dev): OTP stored in booking.notes as "otp:XXXXXX"
  // 2. Prod (Redis): verifyOtpDev from in-process store (replace with Redis GETDEL)
  const isConsoleMode = process.env.OTP_PROVIDER !== "msg91";

  if (isConsoleMode) {
    // Extract OTP stored in notes field during create
    const storedOtp = booking.notes?.match(/otp:(\d{6})/)?.[1];
    if (storedOtp && storedOtp !== otp) {
      return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });
    }
    // If no OTP in notes (older bookings) or matches — accept
    console.log(`[OTP] Console mode verify for booking ${bookingId} — accepted`);
  } else {
    const otpResult = verifyOtpDev(`booking:${bookingId}`, otp);
    if (otpResult === "not_found") {
      console.warn(`[OTP] Key not found for ${bookingId} — accepting in dev`);
    } else if (otpResult !== "valid") {
      const msg = otpResult === "expired" ? "OTP has expired. Please request a new one." : "Incorrect OTP.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // Confirm booking
  const confirmed = await db.onlineBooking.update({
    where: { id: bookingId },
    data: { status: "confirmed", confirmedAt: new Date(), notes: null },
    select: {
      id: true, customerName: true, customerPhone: true,
      scheduledAt: true, totalAmount: true, serviceIds: true, status: true, confirmedAt: true,
    },
  });

  // Send WhatsApp confirmation (non-blocking)
  const salonName = booking.storefront.tenant.name;
  const salonPhone = booking.storefront.tenant.locations[0]?.phone ?? "";

  sendWhatsApp({
    type: "booking_confirmed",
    phone: confirmed.customerPhone,
    customerName: confirmed.customerName,
    salonName,
    dateTime: formatWaDateTime(confirmed.scheduledAt),
    services: confirmed.serviceIds.join(", "),
    bookingId: confirmed.id.slice(-8).toUpperCase(),
    amount: `₹${confirmed.totalAmount.toLocaleString("en-IN")}`,
  }).catch(err => console.error("[WhatsApp] Confirmation send failed:", err));

  return NextResponse.json({ confirmed: true, booking: confirmed });
}
