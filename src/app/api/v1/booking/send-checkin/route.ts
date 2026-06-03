// POST /api/v1/booking/send-checkin
// Staff-authenticated. Called when customer physically arrives at the salon.
// Generates a fresh 6-digit check-in code and sends it to the customer via WhatsApp/SMS.
// The customer reads it aloud; staff enters it in the app to confirm arrival.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";
import { generateOtp } from "@/lib/otp";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({ bookingId: z.string() });

export async function POST(req: NextRequest) {
  // Rate limit: 20 check-in code sends per IP per 10 minutes (prevents SMS flooding).
  const ip = getClientIp(req);
  const ipResult = await rateLimit(`checkin:ip:${ip}`, 20, 10 * 60 * 1000);
  if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfter);

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
      storefront: { include: { tenant: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Booking must be confirmed to send check-in code" }, { status: 409 });
  }

  const code = generateOtp(); // 6-digit code

  await db.onlineBooking.update({
    where: { id: bookingId },
    data: { checkinCode: code, checkinCodeSentAt: new Date() },
  });

  const salonName = booking.storefront.tenant.name;
  const isConsole = process.env.OTP_PROVIDER !== "msg91";

  if (isConsole) {
    console.log(`[CHECK-IN CODE] Booking ${bookingId} | Customer: ${booking.customerName} | Code: ${code}`);
  } else {
    await sendWhatsApp({
      type: "checkin_code",
      phone: booking.customerPhone,
      customerName: booking.customerName,
      salonName,
      code,
    }).catch((e) => console.error("[WhatsApp] Check-in code send failed:", e));
  }

  return ok({ sent: true, code: isConsole ? code : undefined });
}
