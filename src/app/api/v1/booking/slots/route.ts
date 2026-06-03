// GET /api/v1/booking/slots?tenantId=&date=YYYY-MM-DD&staffDetailId=&serviceIds=id1,id2
// Public route — no auth required. Returns available time slots for a given date.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SLOT_INTERVAL_MINS = 30;

function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Default working hours if not configured per-staff
const DEFAULT_START = 10 * 60; // 10:00
const DEFAULT_END = 20 * 60;   // 20:00

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const dateStr = searchParams.get("date");
  const staffDetailId = searchParams.get("staffDetailId") ?? undefined;

  if (!tenantId || !dateStr) {
    return NextResponse.json({ error: "tenantId and date required" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00+05:30");
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const dayStart = new Date(dateStr + "T00:00:00+05:30");
  const dayEnd = new Date(dateStr + "T23:59:59+05:30");

  // Load bookable staff for this tenant
  const staffList = await db.staffDetail.findMany({
    where: {
      ...(staffDetailId ? { id: staffDetailId } : {}),
      isBookable: true,
      location: { tenantId },
    },
    include: { user: { select: { fullName: true } } },
  });

  // No bookable staff yet — generate generic slots for the salon's opening hours
  // so customers can still book even before staff are configured.
  if (staffList.length === 0) {
    const sf = await db.storefront.findUnique({
      where: { tenantId },
      select: { openingHours: true },
    });
    const hours = sf?.openingHours as Record<string, { open: string; close: string; closed?: boolean }> | null;
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayNames[date.getDay()];
    const dayHours = hours?.[dayKey];

    const start = dayHours && !dayHours.closed ? timeToMins(dayHours.open) : DEFAULT_START;
    const end   = dayHours && !dayHours.closed ? timeToMins(dayHours.close) : DEFAULT_END;

    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const nowMinsG = nowIST.getHours() * 60 + nowIST.getMinutes();
    const isTodayG = date.toDateString() === nowIST.toDateString();
    const cutoffG = isTodayG ? nowMinsG + 30 : -1;

    const genericSlots = [];
    for (let slotMins = start; slotMins + SLOT_INTERVAL_MINS <= end; slotMins += SLOT_INTERVAL_MINS) {
      if (slotMins < cutoffG) continue; // skip past slots
      genericSlots.push({ time: minsToTime(slotMins), staffId: null, staffName: "Any stylist" });
    }
    return NextResponse.json({ slots: genericSlots });
  }

  // Load existing confirmed online bookings for that day
  const existingBookings = await db.onlineBooking.findMany({
    where: {
      tenantId,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["confirmed", "visited"] },
      ...(staffDetailId ? { staffDetailId } : {}),
    },
    select: { staffDetailId: true, scheduledAt: true, durationMins: true },
  });

  // Also load internal appointments for staff conflict check
  const existingAppointments = await db.appointment.findMany({
    where: {
      location: { tenantId },
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["confirmed", "in_progress"] },
      ...(staffDetailId ? { staffId: staffDetailId } : {}),
    },
    select: { staffId: true, startsAt: true, endsAt: true },
  });

  const slots: Array<{ time: string; staffId: string; staffName: string }> = [];

  for (const staff of staffList) {
    // Determine working hours
    const workingHours = staff.workingHours as { start?: string; end?: string } | null;
    const start = workingHours?.start ? timeToMins(workingHours.start) : DEFAULT_START;
    const end = workingHours?.end ? timeToMins(workingHours.end) : DEFAULT_END;

    // Build occupied blocks for this staff member
    const occupied: Array<{ start: number; end: number }> = [
      ...existingBookings
        .filter((b) => b.staffDetailId === staff.id)
        .map((b) => {
          const t = new Date(b.scheduledAt);
          const m = t.getHours() * 60 + t.getMinutes();
          return { start: m, end: m + b.durationMins };
        }),
      ...existingAppointments
        .filter((a) => a.staffId === staff.id)
        .map((a) => {
          const s = new Date(a.startsAt);
          const e = new Date(a.endsAt);
          return {
            start: s.getHours() * 60 + s.getMinutes(),
            end: e.getHours() * 60 + e.getMinutes(),
          };
        }),
    ];

    for (let slotMins = start; slotMins + SLOT_INTERVAL_MINS <= end; slotMins += SLOT_INTERVAL_MINS) {
      const slotEnd = slotMins + SLOT_INTERVAL_MINS;
      const busy = occupied.some((b) => slotMins < b.end && slotEnd > b.start);
      if (!busy) {
        slots.push({
          time: minsToTime(slotMins),
          staffId: staff.id,
          staffName: staff.user.fullName,
        });
      }
    }
  }

  // Strip past slots when booking for today (with 30-min buffer in IST)
  const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const nowMins = nowIST.getHours() * 60 + nowIST.getMinutes();
  const isToday = date.toDateString() === nowIST.toDateString();
  const cutoff = isToday ? nowMins + 30 : -1;

  const filtered = slots.filter((s) => {
    const [h, m] = s.time.split(":").map(Number);
    return h * 60 + m >= cutoff;
  });

  // Sort by time then staffName
  filtered.sort((a, b) => a.time.localeCompare(b.time) || a.staffName.localeCompare(b.staffName));

  return NextResponse.json({ slots: filtered });
}
