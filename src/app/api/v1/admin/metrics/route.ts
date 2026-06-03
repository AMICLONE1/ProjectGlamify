// GET /api/v1/admin/metrics — platform-wide KPIs across all tenants.
// Super-admin only.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last30 = new Date(now.getTime() - 30 * 86_400_000);

  const [
    totalTenants,
    tenantsThisMonth,
    tenantsPrevMonth,
    totalUsers,
    activeUsers,
    totalClients,
    totalBookings,
    bookingsLast30,
    gmvAgg,
    gmvMonthAgg,
    pendingLeads,
    planGroups,
  ] = await Promise.all([
    db.tenant.count(),
    db.tenant.count({ where: { createdAt: { gte: monthStart } } }),
    db.tenant.count({ where: { createdAt: { gte: prevMonthStart, lt: monthStart } } }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.client.count(),
    db.onlineBooking.count(),
    db.onlineBooking.count({ where: { createdAt: { gte: last30 } } }),
    db.invoice.aggregate({ where: { status: "paid" }, _sum: { totalAmt: true } }),
    db.invoice.aggregate({ where: { status: "paid", createdAt: { gte: monthStart } }, _sum: { totalAmt: true } }),
    db.lead.count({ where: { status: "new" } }),
    db.tenant.groupBy({ by: ["plan"], _count: true }),
  ]);

  const tenantGrowthPct =
    tenantsPrevMonth > 0
      ? Math.round(((tenantsThisMonth - tenantsPrevMonth) / tenantsPrevMonth) * 100)
      : tenantsThisMonth > 0
        ? 100
        : 0;

  return ok({
    tenants: {
      total: totalTenants,
      thisMonth: tenantsThisMonth,
      growthPct: tenantGrowthPct,
    },
    users: { total: totalUsers, active: activeUsers },
    clients: { total: totalClients },
    bookings: { total: totalBookings, last30: bookingsLast30 },
    gmv: {
      total: gmvAgg._sum.totalAmt ?? 0,
      thisMonth: gmvMonthAgg._sum.totalAmt ?? 0,
    },
    leads: { pending: pendingLeads },
    plans: planGroups.map((g) => ({ plan: g.plan, count: g._count })),
  });
}
