export type DailyPoint = { date: string; revenue: number; bookings: number };

function buildSeries(): DailyPoint[] {
  const out: DailyPoint[] = [];
  const base = 38000;
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const weekday = d.getDay();
    const seasonality = weekday === 0 ? 0.65 : weekday === 1 ? 0.78 : weekday === 6 ? 1.18 : 1.0;
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 4500;
    const revenue = Math.max(15000, Math.round(base * seasonality + noise));
    const bookings = Math.round(revenue / 1150);
    out.push({
      date: d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" }),
      revenue,
      bookings,
    });
  }
  return out;
}

export const revenue30Days: DailyPoint[] = buildSeries();

export type ServiceMix = { name: string; revenue: number; share: number };

export const serviceMix: ServiceMix[] = [
  { name: "Hair color", revenue: 412800, share: 32 },
  { name: "Cut & blow", revenue: 286400, share: 22 },
  { name: "Facial & skin", revenue: 247600, share: 19 },
  { name: "Nails", revenue: 168200, share: 13 },
  { name: "Spa & wellness", revenue: 124900, share: 10 },
  { name: "Retail", revenue: 58300, share: 4 },
];

export type StaffPerformance = { name: string; revenue: number; services: number; utilization: number };

export const staffPerformance: StaffPerformance[] = [
  { name: "Priya M.", revenue: 312400, services: 168, utilization: 92 },
  { name: "Sneha I.", revenue: 248900, services: 124, utilization: 84 },
  { name: "Rohan S.", revenue: 182600, services: 142, utilization: 76 },
  { name: "Deepa R.", revenue: 108200, services: 96, utilization: 65 },
  { name: "Aanya P.", revenue: 78400, services: 74, utilization: 58 },
];

export type PaymentMix = { name: string; value: number; color: string };

export const paymentMix: PaymentMix[] = [
  { name: "UPI", value: 58, color: "#22d3ee" },
  { name: "Cash", value: 22, color: "#34d399" },
  { name: "Card", value: 14, color: "#fbbf24" },
  { name: "Wallet credit", value: 6, color: "#a78bfa" },
];

export type ClientMix = { name: string; value: number; color: string };

export const clientMix: ClientMix[] = [
  { name: "Returning", value: 68, color: "#22d3ee" },
  { name: "New", value: 22, color: "#34d399" },
  { name: "Lapsed back", value: 10, color: "#fbbf24" },
];

export type ReportRange = "7d" | "30d" | "mtd" | "qtd";

export const rangeLabel: Record<ReportRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  mtd: "Month to date",
  qtd: "Quarter to date",
};
