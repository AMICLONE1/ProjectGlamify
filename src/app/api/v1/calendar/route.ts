// GET /api/v1/calendar?from=ISO&to=ISO
// Returns normalized calendar events for a date range: internal appointments +
// customer online bookings. Also returns the tenant's opening hours so the grid
// can scroll to the shop's actual hours.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/auth";

type CalendarEvent = {
  id: string;
  source: "appointment" | "online";
  startsAt: string;
  endsAt: string;
  status: string;
  title: string;       // client/customer name
  subtitle: string;    // service · staff
  staffName: string | null;
};

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  if (!fromStr || !toStr) return fail("VALIDATION_ERROR", "from and to are required", 422);

  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return fail("VALIDATION_ERROR", "Invalid dates", 422);

  const [appointments, online, storefront] = await Promise.all([
    db.appointment.findMany({
      where: { tenantId: auth.tenantId, startsAt: { gte: from, lt: to } },
      include: {
        client: { select: { fullName: true } },
        staff: { include: { user: { select: { fullName: true } } } },
        items: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startsAt: "asc" },
    }),
    db.onlineBooking.findMany({
      where: { tenantId: auth.tenantId, scheduledAt: { gte: from, lt: to }, status: { in: ["confirmed", "visited", "pending_otp"] } },
      include: { staffDetail: { include: { user: { select: { fullName: true } } } } },
      orderBy: { scheduledAt: "asc" },
    }),
    db.storefront.findUnique({ where: { tenantId: auth.tenantId }, select: { openingHours: true } }),
  ]);

  const events: CalendarEvent[] = [];

  for (const a of appointments) {
    const svc = a.items[0]?.service?.name ?? "Appointment";
    const staffName = a.staff?.user.fullName ?? null;
    events.push({
      id: a.id,
      source: "appointment",
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      status: a.status,
      title: a.client.fullName,
      subtitle: staffName ? `${svc} · ${staffName.split(" ")[0]}` : svc,
      staffName,
    });
  }

  for (const b of online) {
    const end = new Date(b.scheduledAt.getTime() + b.durationMins * 60_000);
    const staffName = b.staffDetail?.user.fullName ?? null;
    events.push({
      id: b.id,
      source: "online",
      startsAt: b.scheduledAt.toISOString(),
      endsAt: end.toISOString(),
      status: b.status,
      title: b.customerName,
      subtitle: staffName ? `Online · ${staffName.split(" ")[0]}` : "Online booking",
      staffName,
    });
  }

  return ok({ events, openingHours: storefront?.openingHours ?? null });
}
