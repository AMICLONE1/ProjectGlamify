import type { Metadata } from "next";
import { RevenueAreaChart } from "@/components/business/dashboard/RevenueAreaChart";
import { ServiceMixDonut } from "@/components/business/dashboard/ServiceMixDonut";
import { BookingsBarChart } from "@/components/business/dashboard/BookingsBarChart";

export const metadata: Metadata = {
  title: "Dashboard — Glamify Business",
  description: "Live command center for bookings, billing, clients, inventory, campaigns, and staff.",
};

const kpis = [
  {
    label: "Today's revenue",
    value: "₹42,800",
    delta: "+12%",
    deltaTone: "positive" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M7 5h10M7 9h10M8 13h4a4 4 0 000-8M7 13l8 7" />
      </svg>
    ),
    tone: "violet" as const,
  },
  {
    label: "Bookings",
    value: "38",
    delta: "+8%",
    deltaTone: "positive" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M8 3v3M16 3v3M3 10h18" />
      </svg>
    ),
    tone: "orange" as const,
  },
  {
    label: "Avg ticket",
    value: "₹1,127",
    delta: "+15%",
    deltaTone: "positive" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M20 12V6.4a1.4 1.4 0 00-1.4-1.4H5.4A1.4 1.4 0 004 6.4v11.2a1.4 1.4 0 001.4 1.4H12" />
        <path d="M16 19l2 2 4-4" />
      </svg>
    ),
    tone: "yellow" as const,
  },
];

const todaySchedule = [
  { time: "10:00", client: "Ananya Sharma", service: "Hair cut + gloss", staff: "Priya", status: "now" as const },
  { time: "10:30", client: "Karan Mehta", service: "Beard trim", staff: "Rohan", status: "next" as const },
  { time: "11:00", client: "Meera Joshi", service: "Hydra facial", staff: "Sneha", status: "later" as const },
  { time: "11:30", client: "Walk-in · 1", service: "Mani + Pedi", staff: "Deepa", status: "queued" as const },
];

const aiAlerts = [
  { tag: "Scheduling", body: "Tuesday slots 8–11 AM are 23% underbooked. Send a Tuesday-only push?" },
  { tag: "Churn", body: "Ananya S. usually visits every 21 days. It's been 38 days. Re-engage now." },
  { tag: "Inventory", body: "Platinum developer runs out Saturday. Reorder 4 units." },
];

export default function BusinessDashboardPage() {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-6">
          <p className="text-sm text-biz-muted">Optimize bookings and grow revenue</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-biz-ink sm:text-3xl">
            Welcome, Priya!
          </h1>
          <p className="mt-3 text-sm text-biz-muted">
            Bandra Branch · Tue, 28 May · 9:00 AM – 8:00 PM
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <GoalCard />
        <ChartCard>
          <RevenueAreaChart />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ChartCard>
          <ServiceMixDonut />
        </ChartCard>
        <ChartCard>
          <BookingsBarChart />
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-biz-ink">Today&apos;s schedule</h3>
              <p className="mt-0.5 text-xs text-biz-muted">5 of 12 bookings · Bandra Branch</p>
            </div>
            <a href="/business/calendar" className="rounded-full bg-biz-bg px-3 py-1.5 text-xs font-medium text-biz-ink hover:bg-biz-border">
              See all →
            </a>
          </div>
          <ul className="mt-5 space-y-2">
            {todaySchedule.map((apt) => (
              <li key={apt.time + apt.client} className="flex items-center gap-3 rounded-2xl bg-biz-bg px-4 py-3">
                <span className="w-12 font-mono text-xs font-medium text-biz-muted">{apt.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-biz-ink">{apt.client}</p>
                  <p className="truncate text-xs text-biz-muted">{apt.service} · {apt.staff}</p>
                </div>
                <StatusBadge status={apt.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-biz-ink">AI alerts</h3>
              <p className="mt-0.5 text-xs text-biz-muted">3 things worth your attention</p>
            </div>
            <span className="rounded-full bg-biz-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-biz-violet-700">
              Live
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {aiAlerts.map((alert) => (
              <li key={alert.tag} className="rounded-2xl bg-biz-bg p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">
                  {alert.tag}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-biz-ink">{alert.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

type KpiTone = "violet" | "orange" | "yellow";

function KpiCard({
  label,
  value,
  delta,
  deltaTone,
  icon,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "positive" | "negative";
  icon: React.ReactNode;
  tone: KpiTone;
}) {
  const iconBg: Record<KpiTone, string> = {
    violet: "bg-biz-violet-50 text-biz-violet-600",
    orange: "bg-biz-orange-300/30 text-biz-orange-600",
    yellow: "bg-biz-yellow-300/30 text-biz-yellow-500",
  };

  return (
    <div className="rounded-3xl bg-biz-surface p-4 sm:p-5 md:p-6 lg:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 ${iconBg[tone]}`}>
          {icon}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ${
            deltaTone === "positive"
              ? "bg-biz-green-400/15 text-biz-green-500"
              : "bg-red-100 text-red-600"
          }`}
        >
          ↑ {delta}
        </span>
      </div>
      <p className="mt-3 sm:mt-4 font-display text-lg sm:text-2xl md:text-2xl lg:text-2xl font-bold text-biz-ink">{value}</p>
      <p className="mt-1 text-xs text-biz-muted">{label}</p>
    </div>
  );
}

function GoalCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-biz-violet-500 via-biz-violet-600 to-biz-magenta-600 p-6 text-white shadow-lg shadow-biz-violet-500/20 sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]"
      />
      <div
        aria-hidden
        className="absolute -top-2 right-4 h-32 w-32 rounded-full bg-white/5"
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Revenue Goal</h3>
          <a href="/business/reports" className="text-xs font-medium text-white/80 hover:text-white">
            See all →
          </a>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-biz-orange-400 via-biz-orange-500 to-biz-pink-500 p-5 shadow-lg">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/80">**** 9991</p>
          <p className="mt-6 text-xs text-white/80">Month-to-date</p>
          <p className="mt-1 font-display text-3xl font-bold">₹12,45,000</p>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm">
            <span className="font-semibold">7 of 10</span>
            <span className="ml-1 text-white/80">goals on track</span>
          </p>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-3 rounded-full ${i < 7 ? "bg-white" : "bg-white/25"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-6">
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: "now" | "next" | "later" | "queued" }) {
  const style: Record<typeof status, string> = {
    now: "bg-biz-green-400/15 text-biz-green-500",
    next: "bg-biz-orange-300/25 text-biz-orange-600",
    later: "bg-biz-bg text-biz-muted",
    queued: "bg-biz-violet-50 text-biz-violet-600",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-2xs sm:text-[10px] font-semibold uppercase tracking-wider ${style[status]}`}
    >
      {status}
    </span>
  );
}
