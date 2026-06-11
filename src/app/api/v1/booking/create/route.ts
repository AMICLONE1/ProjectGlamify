// POST /api/v1/booking/create
// Public route. Creates an OnlineBooking in PENDING_OTP status and sends OTP via MSG91 / console.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateOtp, sendOtp, storeOtpDev } from "@/lib/otp";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  tenantId:      z.string(),
  storefrontSlug: z.string(),
  serviceIds:    z.array(z.string()).min(1),
  staffDetailId: z.string().nullable().optional(),
  date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:          z.string().regex(/^\d{2}:\d{2}$/),
  customerName:  z.string().min(2).max(100),
  customerPhone: z.string().regex(/^\d{10}$/),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 booking attempts per IP per 15 minutes.
  // Per-phone limit: 5 attempts per phone per hour (applied after parsing).
  const ip = getClientIp(req);
  const ipResult = await rateLimit(`booking:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.flatten();
    // Log only which fields failed — never the raw body (it carries the
    // customer's name and phone number; PII must not land in server logs).
    console.error("[booking/create] Validation failed for fields:", Object.keys(issues.fieldErrors).join(", ") || "(form)");
    return NextResponse.json({
      error: "Invalid request",
      details: issues,
      message: Object.entries(issues.fieldErrors).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`).join(" | "),
    }, { status: 422 });
  }

  const { tenantId, storefrontSlug, serviceIds, staffDetailId, date, time, customerName, customerPhone } = parsed.data;

  // Per-phone rate limit: 5 OTP requests per phone number per hour.
  const phoneResult = await rateLimit(`booking:phone:${customerPhone}`, 5, 60 * 60 * 1000);
  if (!phoneResult.allowed) return rateLimitResponse(phoneResult.retryAfter);

  // For seed-data storefronts (no DB): skip DB lookup and return a fake booking ID
  // This allows the storefront demo to work without a connected database
  const isDevFallback = tenantId === "seed";
  if (isDevFallback) {
    const otp = generateOtp();
    const fakeId = "BKG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    storeOtpDev(`booking:${fakeId}`, otp);
    await sendOtp(customerPhone, otp, "booking");
    return NextResponse.json({ bookingId: fakeId, otpRequired: true }, { status: 201 });
  }

  // Verify storefront
  const storefront = await db.storefront.findFirst({
    where: { tenantId, slug: storefrontSlug, isPublished: true },
  });
  if (!storefront) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  // Verify services
  const services = await db.service.findMany({
    where: { tenantId, id: { in: serviceIds }, isActive: true },
    select: { id: true, name: true, durationMinutes: true, price: true },
  });
  if (services.length !== serviceIds.length) {
    return NextResponse.json({ error: "One or more services not found" }, { status: 400 });
  }

  const durationMins  = services.reduce((s, svc) => s + svc.durationMinutes, 0);
  const totalAmount   = services.reduce((s, svc) => s + svc.price, 0);
  const servicesLabel = services.map(s => s.name).join(", ");

  // Parse scheduledAt in IST
  const [h, m] = time.split(":").map(Number);
  const scheduledAt = new Date(`${date}T${time}:00+05:30`);
  if (isNaN(scheduledAt.getTime()) || h < 0 || h > 23 || m < 0 || m > 59) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }

  // Reject bookings outside the salon's opening hours (defence in depth — the slot
  // API already filters, but never trust the client). Evaluate the weekday in IST.
  const hours = storefront.openingHours as Record<string, { open: string; close: string; closed?: boolean }> | null;
  if (hours) {
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const [yy, mm, dd] = date.split("-").map(Number);
    const istWeekday = new Date(Date.UTC(yy, mm - 1, dd, 12, 0, 0)).getUTCDay();
    const dayHours = hours[dayNames[istWeekday]];
    if (dayHours && !dayHours.closed) {
      const toMins = (t: string) => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
      const startMins = toMins(dayHours.open);
      const closeMins = toMins(dayHours.close);
      const reqMins = h * 60 + m;
      const endMins = reqMins + durationMins;
      if (Number.isFinite(startMins) && Number.isFinite(closeMins) &&
          (reqMins < startMins || endMins > closeMins)) {
        return NextResponse.json({ error: "That time is outside the salon's opening hours." }, { status: 422 });
      }
    } else if (dayHours?.closed) {
      return NextResponse.json({ error: "The salon is closed on that day." }, { status: 422 });
    }
  }

  // Slot conflict check
  if (staffDetailId) {
    const slotEnd = new Date(scheduledAt.getTime() + durationMins * 60_000);
    const conflict = await db.onlineBooking.findFirst({
      where: {
        staffDetailId,
        status: { in: ["pending_otp", "confirmed"] },
        scheduledAt: { lt: slotEnd },
        AND: [{ scheduledAt: { gte: new Date(scheduledAt.getTime() - durationMins * 60_000) } }],
      },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slot no longer available. Please pick another time." }, { status: 409 });
    }
  }

  // Generate OTP and create booking.
  const otp = generateOtp();

  const booking = await db.onlineBooking.create({
    data: {
      tenantId,
      storefrontId: storefront.id,
      customerName,
      customerPhone,
      staffDetailId: staffDetailId ?? null,
      serviceIds,
      scheduledAt,
      durationMins,
      totalAmount,
      status: "pending_otp",
      bookingOtpSentAt: new Date(),
      // Never persist the OTP to the database. The in-process store (below) holds
      // it with a TTL; if SMS is configured the customer receives it out-of-band.
      notes: `services:${servicesLabel}`,
    },
  });

  // Store OTP in-process map with a 10-min TTL (swap for Redis at scale).
  storeOtpDev(`booking:${booking.id}`, otp, 600);

  // Send OTP via MSG91 (or no-op console in dev). Never logs the code in prod.
  await sendOtp(customerPhone, otp, "booking");

  return NextResponse.json({ bookingId: booking.id, otpRequired: true }, { status: 201 });
}
