import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const baseWhere = {
    tenantId: auth.tenantId,
    ...(locationId ? { locationId } : {}),
  };

  const [
    todayAppointments,
    monthInvoices,
    prevMonthInvoices,
    totalClients,
    newClientsThisMonth,
    lowStockProducts,
    upcomingToday,
  ] = await Promise.all([
    db.appointment.count({ where: { ...baseWhere, startsAt: { gte: todayStart, lt: todayEnd } } }),
    db.invoice.aggregate({
      where: { ...baseWhere, status: "paid", createdAt: { gte: monthStart } },
      _sum: { totalAmt: true },
      _count: true,
    }),
    db.invoice.aggregate({
      where: { ...baseWhere, status: "paid", createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { totalAmt: true },
      _count: true,
    }),
    db.client.count({ where: { tenantId: auth.tenantId } }),
    db.client.count({ where: { tenantId: auth.tenantId, createdAt: { gte: monthStart } } }),
    db.product.count({
      where: {
        tenantId: auth.tenantId,
        isActive: true,
        stockQty: { lte: 0 },
      },
    }),
    db.appointment.findMany({
      where: { ...baseWhere, startsAt: { gte: todayStart, lt: todayEnd }, status: { in: ["confirmed", "in_progress"] } },
      include: {
        client: { select: { id: true, fullName: true } },
        staff: { include: { user: { select: { id: true, fullName: true } } } },
        items: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
  ]);

  // Monthly revenue goal (stored in tenant settings JSON)
  const tenant = await db.tenant.findUnique({ where: { id: auth.tenantId }, select: { settings: true } });
  const revenueGoal = (tenant?.settings as { revenueGoal?: number } | null)?.revenueGoal ?? null;

  const monthRevenue = monthInvoices._sum.totalAmt ?? 0;
  const prevRevenue = prevMonthInvoices._sum.totalAmt ?? 1;
  const revenueChangePct = parseFloat((((monthRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));

  return ok({
    kpis: {
      todayAppointments,
      monthRevenue,
      revenueChangePct,
      monthBookings: monthInvoices._count,
      totalClients,
      newClientsThisMonth,
      lowStockAlerts: lowStockProducts,
      revenueGoal,
    },
    upcomingToday,
  });
}
