// GET /api/v1/dashboard/charts — real per-tenant chart series.
// Returns: revenueTrends (last 14 days), serviceMix (this month by service),
// bookingsThisWeek (this week vs same week last month). Empty arrays for new tenants.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const SERVICE_COLORS = ["#7c3aed", "#f97316", "#facc15", "#ec4899", "#22c55e", "#06b6d4", "#a855f7"];

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 14-day window
  const start14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);

  // This week (Mon-Sun) + same week last month
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  const lastMonthWeekStart = new Date(weekStart.getFullYear(), weekStart.getMonth() - 1, weekStart.getDate());
  const lastMonthWeekEnd = new Date(lastMonthWeekStart.getTime() + 7 * 86_400_000);

  const [paidInvoices14, monthLineItems, weekBookings, lastMonthBookings] = await Promise.all([
    // Revenue trends — paid invoices in last 14 days
    db.invoice.findMany({
      where: { tenantId: auth.tenantId, status: "paid", createdAt: { gte: start14 } },
      select: { totalAmt: true, createdAt: true },
    }),
    // Service mix — line items on paid invoices this month
    db.invoiceLineItem.findMany({
      where: {
        invoice: { tenantId: auth.tenantId, status: "paid", createdAt: { gte: monthStart } },
      },
      select: { label: true, lineTotal: true, service: { select: { name: true } } },
    }),
    // Bookings this week — online bookings scheduled this week
    db.onlineBooking.findMany({
      where: { tenantId: auth.tenantId, scheduledAt: { gte: weekStart }, status: { in: ["confirmed", "visited"] } },
      select: { scheduledAt: true },
    }),
    db.onlineBooking.findMany({
      where: {
        tenantId: auth.tenantId,
        scheduledAt: { gte: lastMonthWeekStart, lt: lastMonthWeekEnd },
        status: { in: ["confirmed", "visited"] },
      },
      select: { scheduledAt: true },
    }),
  ]);

  // ── Revenue trends: bucket by day for 14 days ──
  const revByDay = new Map<string, number>();
  for (const inv of paidInvoices14) {
    const k = dayKey(new Date(inv.createdAt));
    revByDay.set(k, (revByDay.get(k) ?? 0) + inv.totalAmt);
  }
  const revenueTrends = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start14.getFullYear(), start14.getMonth(), start14.getDate() + i);
    return {
      day: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      revenue: Math.round(revByDay.get(dayKey(d)) ?? 0),
    };
  });

  // ── Service mix: group line items by service name ──
  const mixMap = new Map<string, number>();
  for (const li of monthLineItems) {
    const name = li.service?.name ?? li.label ?? "Other";
    mixMap.set(name, (mixMap.get(name) ?? 0) + li.lineTotal);
  }
  const serviceMix = Array.from(mixMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], i) => ({ name, value: Math.round(value), color: SERVICE_COLORS[i % SERVICE_COLORS.length] }));

  // ── Bookings this week by weekday ──
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const thisWeek = new Array(7).fill(0);
  const lastMonth = new Array(7).fill(0);
  for (const b of weekBookings) thisWeek[(new Date(b.scheduledAt).getDay() + 6) % 7]++;
  for (const b of lastMonthBookings) lastMonth[(new Date(b.scheduledAt).getDay() + 6) % 7]++;
  const bookingsThisWeek = WEEKDAYS.map((day, i) => ({ day, today: thisWeek[i], yesterday: lastMonth[i] }));

  const hasRevenue = revenueTrends.some((d) => d.revenue > 0);
  const hasBookings = bookingsThisWeek.some((d) => d.today > 0 || d.yesterday > 0);

  return ok({
    revenueTrends,
    serviceMix,
    bookingsThisWeek,
    hasRevenue,
    hasServiceMix: serviceMix.length > 0,
    hasBookings,
  });
}
