// POST /api/v1/booking/verify-otp
// Public. Verifies booking OTP and sends WhatsApp confirmation.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyOtpDev } from "@/lib/otp";
import { sendWhatsApp, formatWaDateTime } from "@/lib/whatsapp";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  bookingId: z.string(),
  otp:       z.string().length(6).regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 OTP attempts per IP per 15 minutes (prevents brute-force of 6-digit codes).
  const ip = getClientIp(req);
  const ipResult = await rateLimit(`otp:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { bookingId, otp } = parsed.data;

  // Per-booking rate limit: 5 attempts per booking ID (locks out a specific brute-force attempt).
  const bookingResult = await rateLimit(`otp:booking:${bookingId}`, 5, 15 * 60 * 1000);
  if (!bookingResult.allowed) return rateLimitResponse(bookingResult.retryAfter);

  // Seed/demo storefronts (BKG-… ids) have no DB row — accept any 6-digit code.
  const isDemoBooking = bookingId.startsWith("BKG-");
  if (isDemoBooking) {
    const result = verifyOtpDev(`booking:${bookingId}`, otp);
    if (result === "valid" || otp.length === 6) {
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

  // ── OTP verification ──────────────────────────────────────────────────────
  // NOTE: SMS (MSG91) is not yet configured, so a real OTP can't be delivered to
  // the customer. Until SMS is live, we accept any valid 6-digit code so booking
  // still works end-to-end. When OTP_PROVIDER=msg91 is set, this automatically
  // switches to strict verification of the code that was actually sent.
  //   TODO(security): enforce strict OTP once MSG91 is configured.
  const smsConfigured = process.env.OTP_PROVIDER === "msg91";

  if (smsConfigured) {
    // Strict: verify the exact code that was sent (held in the in-process store).
    const storeResult = verifyOtpDev(`booking:${bookingId}`, otp);
    if (storeResult !== "valid") {
      return NextResponse.json(
        { error: storeResult === "expired" ? "OTP has expired. Please request a new one." : "Incorrect OTP." },
        { status: 400 }
      );
    }
  }
  // else: SMS not configured — accept the 6-digit code (already validated by schema).

  // Confirm booking
  const confirmed = await db.onlineBooking.update({
    where: { id: bookingId },
    data: { status: "confirmed", confirmedAt: new Date(), notes: null },
    select: {
      id: true, customerName: true, customerPhone: true,
      scheduledAt: true, totalAmount: true, serviceIds: true, status: true, confirmedAt: true,
    },
  });

  // Auto-create a Client record for this customer if one doesn't exist yet.
  // This makes online bookers appear in the Clients section automatically.
  db.client.findFirst({
    where: { tenantId: booking.tenantId, phone: confirmed.customerPhone },
  }).then((existing) => {
    if (!existing) {
      return db.client.create({
        data: {
          tenantId: booking.tenantId,
          fullName: confirmed.customerName,
          phone: confirmed.customerPhone,
          tags: ["new"],
        },
      });
    }
  }).catch(() => {}); // non-blocking

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
