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

// Weekday index (0=Sun..6=Sat) for a YYYY-MM-DD date, evaluated in IST.
// Parsing the date parts directly avoids UTC-vs-IST off-by-one-day errors.
function istWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  // Noon UTC on that calendar date is always the same weekday in IST.
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

// YYYY-MM-DD string for a Date already shifted into IST wall-clock.
function istDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    // Compute the weekday in IST (not server UTC) — otherwise a date at
    // midnight IST reads as the *previous* day on a UTC server.
    const dayKey = dayNames[istWeekday(dateStr)];
    const dayHours = hours?.[dayKey];

    // Only treat the day as closed if explicitly marked closed. If hours are
    // missing or malformed, fall back to defaults so booking still works.
    const openMins  = dayHours && !dayHours.closed ? timeToMins(dayHours.open) : NaN;
    const closeMins = dayHours && !dayHours.closed ? timeToMins(dayHours.close) : NaN;
    const isClosed  = !!dayHours?.closed;
    const start = !isClosed && Number.isFinite(openMins)  ? openMins  : (isClosed ? -1 : DEFAULT_START);
    const end   = !isClosed && Number.isFinite(closeMins) ? closeMins : (isClosed ? -1 : DEFAULT_END);

    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const nowMinsG = nowIST.getHours() * 60 + nowIST.getMinutes();
    const isTodayG = dateStr === istDateStr(nowIST);
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
    // Determine working hours (fall back to defaults if missing/malformed)
    const workingHours = staff.workingHours as { start?: string; end?: string } | null;
    const wStart = workingHours?.start ? timeToMins(workingHours.start) : NaN;
    const wEnd   = workingHours?.end ? timeToMins(workingHours.end) : NaN;
    const start = Number.isFinite(wStart) ? wStart : DEFAULT_START;
    const end   = Number.isFinite(wEnd)   ? wEnd   : DEFAULT_END;

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
  const isToday = dateStr === istDateStr(nowIST);
  const cutoff = isToday ? nowMins + 30 : -1;

  const filtered = slots.filter((s) => {
    const [h, m] = s.time.split(":").map(Number);
    return h * 60 + m >= cutoff;
  });

  // Sort by time then staffName
  filtered.sort((a, b) => a.time.localeCompare(b.time) || a.staffName.localeCompare(b.staffName));

  return NextResponse.json({ slots: filtered });
}
