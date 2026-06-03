"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { reportsApi } from "@/lib/api-client";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";

type ReportRange = "7d" | "30d" | "mtd" | "qtd";
const rangeLabel: Record<ReportRange, string> = { "7d": "7 days", "30d": "30 days", mtd: "MTD", qtd: "QTD" };
const RANGE_KEYS: ReportRange[] = ["7d", "30d", "mtd", "qtd"];

const tooltipStyle = {
  background: "#1a1530",
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  color: "white",
  fontSize: 12,
};

const tooltipLabelStyle = { color: "rgba(255,255,255,0.6)", marginBottom: 4 };

const PIE_PAYMENT = ["#7c3aed", "#22c55e", "#facc15", "#ec4899"];
const PIE_CLIENT = ["#7c3aed", "#f97316", "#facc15"];

export function ReportsBoard() {
  const [range, setRange] = useState<ReportRange>("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", range],
    queryFn: () => reportsApi.get(range),
  });

  const series = data?.revenueTrend ?? [];
  const serviceMix = data?.serviceMix ?? [];
  const paymentMix = data?.paymentMix ?? [];
  const clientMix = data?.clientMix ?? [];
  const totals = data?.kpis ?? { revenue: 0, bookings: 0, avgTicket: 0, totalClients: 0 };
  const hasData = data?.hasData ?? false;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Reports</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            Business performance · {rangeLabel[range]}
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">Real-time KPIs and four pre-built reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
            {RANGE_KEYS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  range === r ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink"
                )}
              >
                {rangeLabel[r]}
              </button>
            ))}
          </div>
          {hasData && (
            <button
              type="button"
              onClick={() => exportCsv({ range, rangeLabel: rangeLabel[range], series, serviceMix, paymentMix, totals })}
              className="rounded-full border border-biz-border bg-biz-surface px-4 py-1.5 text-xs font-semibold text-biz-ink hover:bg-biz-bg"
            >
              ↓ Export CSV
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <>
            <ReportKpiSkeleton /><ReportKpiSkeleton /><ReportKpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Revenue" value={formatINR(totals.revenue)} hint={rangeLabel[range]} tone="violet" />
            <KpiCard label="Paid bookings" value={totals.bookings.toLocaleString("en-IN")} hint="Paid invoices" tone="orange" />
            <KpiCard label="Average ticket" value={formatINR(Math.round(totals.avgTicket))} hint="Per paid invoice" tone="yellow" />
          </>
        )}
      </section>

      {!hasData && !isLoading && (
        <div className="rounded-3xl border border-dashed border-biz-border bg-biz-surface p-10 text-center">
          <p className="text-sm font-medium text-biz-ink">No report data yet</p>
          <p className="mt-1 text-xs text-biz-muted">Record sales in POS — your revenue, service mix, and client breakdown will populate here.</p>
        </div>
      )}

      {hasData && (

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Revenue trend" subtitle={`${rangeLabel[range]} · in ₹`}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFillReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ebe9f1" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9c95b3"
                tick={{ fill: "#9c95b3", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                stroke="#9c95b3"
                tick={{ fill: "#9c95b3", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                width={36}
              />
              <Tooltip
                cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value) => [formatINR(Number(value)), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revFillReports)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by service category" subtitle={`${rangeLabel[range]} · top 6`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serviceMix} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#ebe9f1" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9c95b3"
                tick={{ fill: "#9c95b3", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={50}
              />
              <YAxis
                stroke="#9c95b3"
                tick={{ fill: "#9c95b3", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.06)" }}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value) => [formatINR(Number(value)), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment & client mix" subtitle="How revenue & clients break down">
          <div className="grid h-[260px] gap-4 sm:grid-cols-2">
            {paymentMix.length > 0 ? (
              <DonutBlock label="Payment method" data={paymentMix} palette={PIE_PAYMENT} />
            ) : (
              <EmptyMini label="Payment method" />
            )}
            {clientMix.length > 0 ? (
              <DonutBlock label="Client mix" data={clientMix} palette={PIE_CLIENT} />
            ) : (
              <EmptyMini label="Client mix" />
            )}
          </div>
        </ChartCard>
      </div>
      )}
    </div>
  );
}

function ReportKpiSkeleton() {
  return (
    <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="h-3 w-20 animate-pulse rounded-full bg-biz-bg" />
      <div className="mt-3 h-7 w-28 animate-pulse rounded-xl bg-biz-bg" />
      <div className="mt-2 h-3 w-16 animate-pulse rounded-full bg-biz-bg" />
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <p className="mt-2 text-xs text-biz-muted">No data yet</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "violet" | "orange" | "yellow";
}) {
  const toneCls = {
    violet: "text-biz-violet-600",
    orange: "text-biz-orange-600",
    yellow: "text-biz-yellow-500",
  }[tone];
  return (
    <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-biz-ink">{value}</p>
      <p className={cn("mt-1 text-xs font-medium", toneCls)}>{hint}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-biz-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-biz-muted">{subtitle}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function exportCsv({ range, rangeLabel, series, serviceMix, paymentMix, totals }: {
  range: string;
  rangeLabel: string;
  series: { date: string; revenue: number }[];
  serviceMix: { name: string; revenue: number }[];
  paymentMix: { name: string; value: number }[];
  totals: { revenue: number; bookings: number; avgTicket: number };
}) {
  const rows: string[][] = [];

  rows.push([`Clitell Reports — ${rangeLabel}`, "", "", ""]);
  rows.push([]);
  rows.push(["Summary", "", "", ""]);
  rows.push(["Total Revenue", String(totals.revenue), "", ""]);
  rows.push(["Paid Bookings", String(totals.bookings), "", ""]);
  rows.push(["Avg Ticket", String(Math.round(totals.avgTicket)), "", ""]);

  rows.push([]);
  rows.push(["Revenue Trend", "", "", ""]);
  rows.push(["Date", "Revenue (₹)", "", ""]);
  series.forEach((r) => rows.push([r.date, String(r.revenue), "", ""]));

  rows.push([]);
  rows.push(["Service Mix", "", "", ""]);
  rows.push(["Service", "Revenue (₹)", "", ""]);
  serviceMix.forEach((r) => rows.push([r.name, String(r.revenue), "", ""]));

  rows.push([]);
  rows.push(["Payment Mix", "", "", ""]);
  rows.push(["Method", "Share (%)", "", ""]);
  paymentMix.forEach((r) => rows.push([r.name, String(r.value), "", ""]));

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clitell-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function DonutBlock({
  label,
  data,
  palette,
}: {
  label: string;
  data: { name: string; value: number }[];
  palette: string[];
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            stroke="none"
            cornerRadius={4}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value, name) => [`${Number(value)}%`, String(name)]}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#6b6580" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
