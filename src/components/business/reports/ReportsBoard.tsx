"use client";

import { useMemo, useState } from "react";
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
import {
  clientMix,
  paymentMix,
  rangeLabel,
  revenue30Days,
  serviceMix,
  staffPerformance,
  type ReportRange,
} from "@/lib/reports-seed";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";

const RANGE_DAYS: Record<ReportRange, number> = {
  "7d": 7,
  "30d": 30,
  mtd: 28,
  qtd: 30,
};

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

  const series = useMemo(() => {
    const days = RANGE_DAYS[range];
    return revenue30Days.slice(-days);
  }, [range]);

  const totals = useMemo(() => {
    const revenue = series.reduce((sum, d) => sum + d.revenue, 0);
    const bookings = series.reduce((sum, d) => sum + d.bookings, 0);
    const avgTicket = bookings > 0 ? revenue / bookings : 0;
    return { revenue, bookings, avgTicket };
  }, [series]);

  function handleExport(kind: "csv" | "pdf") {
    console.log(`[report:export]`, { kind, range, revenue: totals.revenue, bookings: totals.bookings });
  }

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
            {(Object.keys(RANGE_DAYS) as ReportRange[]).map((r) => (
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
          <button
            type="button"
            onClick={() => handleExport("csv")}
            className="rounded-full bg-biz-bg px-4 py-2 text-xs font-semibold text-biz-ink hover:bg-biz-border"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
          >
            Export PDF
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Revenue" value={formatINR(totals.revenue)} hint={`${rangeLabel[range]} · ↑ 12%`} tone="violet" />
        <KpiCard label="Bookings" value={totals.bookings.toLocaleString("en-IN")} hint="Confirmed + walk-in" tone="orange" />
        <KpiCard label="Average ticket" value={formatINR(Math.round(totals.avgTicket))} hint="Up ₹85 vs prior" tone="yellow" />
      </section>

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

        <ChartCard title="Staff utilization" subtitle="% of working hours booked">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={staffPerformance} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#ebe9f1" strokeDasharray="3 6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#9c95b3"
                tick={{ fill: "#9c95b3", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9c95b3"
                tick={{ fill: "#6b6580", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.06)" }}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value, _name, item) => {
                  const p = item?.payload as { services: number; revenue: number } | undefined;
                  return [
                    `${Number(value)}% · ${p?.services ?? 0} services · ${formatINR(p?.revenue ?? 0)}`,
                    "Utilization",
                  ];
                }}
              />
              <Bar dataKey="utilization" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment & client mix" subtitle="Donut split of how revenue lands">
          <div className="grid h-[260px] gap-4 sm:grid-cols-2">
            <DonutBlock label="Payment method" data={paymentMix} palette={PIE_PAYMENT} />
            <DonutBlock label="Client mix" data={clientMix} palette={PIE_CLIENT} />
          </div>
        </ChartCard>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-biz-violet-500 to-biz-magenta-600 p-6 text-white shadow-lg shadow-biz-violet-500/20">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs font-medium text-white/80">AI insights · last 7 days</p>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed">
            <li>
              <span className="font-semibold">Tuesday underbooked by 23%.</span> Push a Tuesday-only bundle 8–11 AM. Estimated lift: +₹18k weekly.
            </li>
            <li>
              <span className="font-semibold">Hair color revenue trending +14%.</span> Stock Wella Koleston Brown (only 4 left, lead time 2 days).
            </li>
            <li>
              <span className="font-semibold">Priya at 92% utilization.</span> Cap her bookings 14:00–16:00 to avoid burnout, route walk-ins to Aanya (58%).
            </li>
          </ul>
        </div>
      </section>
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
