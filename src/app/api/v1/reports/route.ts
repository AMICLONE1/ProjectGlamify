// GET /api/v1/reports?range=7d|30d|mtd|qtd
// Real business-performance aggregations from paid invoices, line items, and clients.
// Returns empty arrays / zeros for fresh tenants.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, ok } from "@/lib/auth";

type Range = "7d" | "30d" | "mtd" | "qtd";

function rangeStart(range: Range, now: Date): Date {
  switch (range) {
    case "7d": return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    case "mtd": return new Date(now.getFullYear(), now.getMonth(), 1);
    case "qtd": { const q = Math.floor(now.getMonth() / 3) * 3; return new Date(now.getFullYear(), q, 1); }
    case "30d":
    default: return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  }
}

function dayKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Cash", upi: "UPI", card: "Card", wallet: "Wallet", gift_card: "Gift card", complimentary: "Comp",
};

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const range = (new URL(req.url).searchParams.get("range") ?? "30d") as Range;
  const now = new Date();
  const start = rangeStart(range, now);

  const [invoices, lineItems, clients] = await Promise.all([
    db.invoice.findMany({
      where: { tenantId: auth.tenantId, status: "paid", createdAt: { gte: start } },
      select: { totalAmt: true, createdAt: true, paymentMethod: true },
    }),
    db.invoiceLineItem.findMany({
      where: { invoice: { tenantId: auth.tenantId, status: "paid", createdAt: { gte: start } } },
      select: { lineTotal: true, label: true, service: { select: { name: true, category: { select: { name: true } } } } },
    }),
    db.client.findMany({
      where: { tenantId: auth.tenantId },
      select: { totalVisits: true, totalSpend: true, createdAt: true },
    }),
  ]);

  // ── Revenue trend (daily) ──
  const revByDay = new Map<string, number>();
  for (const inv of invoices) {
    const k = dayKey(new Date(inv.createdAt));
    revByDay.set(k, (revByDay.get(k) ?? 0) + inv.totalAmt);
  }
  const days = Math.max(1, Math.round((+now - +start) / 86_400_000) + 1);
  const revenueTrend = Array.from({ length: days }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: Math.round(revByDay.get(dayKey(d)) ?? 0) };
  });

  // ── Revenue by service category ──
  const catMap = new Map<string, number>();
  for (const li of lineItems) {
    const cat = li.service?.category?.name ?? li.service?.name ?? li.label ?? "Other";
    catMap.set(cat, (catMap.get(cat) ?? 0) + li.lineTotal);
  }
  const serviceMix = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }));

  // ── Payment mix (% of revenue) ──
  const payMap = new Map<string, number>();
  let payTotal = 0;
  for (const inv of invoices) {
    payMap.set(inv.paymentMethod, (payMap.get(inv.paymentMethod) ?? 0) + inv.totalAmt);
    payTotal += inv.totalAmt;
  }
  const paymentMix = payTotal === 0 ? [] : Array.from(payMap.entries())
    .map(([m, v]) => ({ name: PAYMENT_LABEL[m] ?? m, value: Math.round((v / payTotal) * 100) }));

  // ── Client mix (new vs returning vs lapsed by count) ──
  const newC = clients.filter((c) => (+now - +new Date(c.createdAt)) <= 30 * 86_400_000).length;
  const returning = clients.filter((c) => c.totalVisits > 1).length;
  const oneTime = clients.filter((c) => c.totalVisits <= 1).length;
  const totalC = clients.length;
  const clientMix = totalC === 0 ? [] : [
    { name: "New", value: Math.round((newC / totalC) * 100) },
    { name: "Returning", value: Math.round((returning / totalC) * 100) },
    { name: "One-time", value: Math.round((oneTime / totalC) * 100) },
  ];

  const revenue = invoices.reduce((s, i) => s + i.totalAmt, 0);
  const bookings = invoices.length;
  const avgTicket = bookings > 0 ? revenue / bookings : 0;

  return ok({
    kpis: { revenue: Math.round(revenue), bookings, avgTicket: Math.round(avgTicket), totalClients: totalC },
    revenueTrend,
    serviceMix,
    paymentMix,
    clientMix,
    hasData: bookings > 0,
  });
}
