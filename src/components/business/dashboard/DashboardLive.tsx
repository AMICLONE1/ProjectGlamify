"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type DashboardData, type UpcomingAppointment } from "@/lib/api-client";
import { RevenueAreaChart } from "./RevenueAreaChart";
import { ServiceMixDonut } from "./ServiceMixDonut";
import { BookingsBarChart } from "./BookingsBarChart";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function DashboardLive() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-4">
      {/* Welcome + KPIs */}
      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-3xl bg-biz-surface p-6 shadow-sm">
          <p className="text-sm text-biz-muted">Optimize bookings and grow revenue</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-biz-ink">
            Good {getGreeting()}!
          </h1>
          <p className="mt-3 text-sm text-biz-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="Today's bookings"
            value={isLoading ? "—" : String(data?.kpis.todayAppointments ?? 0)}
            delta={isLoading ? "" : `${data?.kpis.monthBookings ?? 0} this month`}
            deltaTone="positive"
            tone="violet"
            icon={<CalendarIcon />}
          />
          <KpiCard
            label="Monthly revenue"
            value={isLoading ? "—" : formatINR(data?.kpis.monthRevenue ?? 0)}
            delta={isLoading ? "" : `${(data?.kpis.revenueChangePct ?? 0) > 0 ? "+" : ""}${data?.kpis.revenueChangePct ?? 0}% vs last month`}
            deltaTone={(data?.kpis.revenueChangePct ?? 0) >= 0 ? "positive" : "negative"}
            tone="orange"
            icon={<RevenueIcon />}
          />
          <KpiCard
            label="Total clients"
            value={isLoading ? "—" : String(data?.kpis.totalClients ?? 0)}
            delta={isLoading ? "" : `+${data?.kpis.newClientsThisMonth ?? 0} this month`}
            deltaTone="positive"
            tone="yellow"
            icon={<ClientIcon />}
          />
        </div>
      </section>

      {/* Welcome checklist — shown for new accounts with no activity yet */}
      {!isLoading && (data?.kpis.monthBookings ?? 0) === 0 && (
        <WelcomeChecklist />
      )}

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <GoalCard revenue={data?.kpis.monthRevenue ?? 0} isLoading={isLoading} />
        <ChartCard><RevenueAreaChart /></ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ChartCard><ServiceMixDonut /></ChartCard>
        <ChartCard><BookingsBarChart /></ChartCard>
      </section>

      {/* Today's schedule + alerts */}
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ScheduleCard appointments={data?.upcomingToday ?? []} isLoading={isLoading} />
        <AlertsCard lowStock={data?.kpis.lowStockAlerts ?? 0} newClients={data?.kpis.newClientsThisMonth ?? 0} />
      </section>

      {isError && (
        <p className="text-center text-sm text-red-400">
          Could not load live data. Connect a database to see real KPIs.
        </p>
      )}
    </div>
  );
}

// ─── Welcome checklist (new accounts) ───────────────────────────────────────

function WelcomeChecklist() {
  const steps = [
    {
      done: true,
      icon: "✅",
      title: "Account created",
      desc: "Your Glamify account is set up and ready.",
      action: null,
    },
    {
      done: false,
      icon: "🌐",
      title: "Set up your storefront",
      desc: "Add services, photos, and publish your public booking page.",
      href: "/business/storefront",
      actionLabel: "Set up storefront →",
    },
    {
      done: false,
      icon: "📲",
      title: "Share your storefront link",
      desc: "Send it to customers on WhatsApp, add to Instagram bio.",
      href: "/business/storefront",
      actionLabel: "Get your link →",
    },
    {
      done: false,
      icon: "📈",
      title: "Connect Google Business Profile",
      desc: "Get the 'Book' button on Google Search and Maps.",
      href: "/business/storefront",
      actionLabel: "Connect GBP →",
    },
    {
      done: false,
      icon: "📅",
      title: "Take your first booking",
      desc: "Once your storefront is live, customers can book online.",
      href: "/business/calendar",
      actionLabel: "View calendar →",
    },
  ];

  return (
    <section className="rounded-3xl bg-biz-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-biz-violet-500 mb-1">
            Getting started
          </p>
          <h2 className="text-lg font-bold text-biz-ink">Welcome to Glamify 👋</h2>
          <p className="text-sm text-biz-muted mt-0.5">
            Complete these steps to start taking online bookings.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-biz-violet-50 px-4 py-2">
          <span className="text-lg font-bold text-biz-violet-600">1</span>
          <span className="text-xs text-biz-muted">/ {steps.length} done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 rounded-full bg-biz-border overflow-hidden">
        <div className="h-full rounded-full bg-biz-violet-500 transition-all" style={{ width: `${(1 / steps.length) * 100}%` }} />
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
              step.done
                ? "border-biz-green-400/30 bg-biz-green-400/5"
                : "border-biz-border bg-biz-bg hover:border-biz-violet-200"
            }`}
          >
            <span className="text-2xl shrink-0">{step.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${step.done ? "line-through text-biz-muted" : "text-biz-ink"}`}>
                {step.title}
              </p>
              <p className="text-xs text-biz-muted mt-0.5">{step.desc}</p>
            </div>
            {!step.done && step.href && (
              <a
                href={step.href}
                className="shrink-0 rounded-full bg-biz-violet-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-biz-violet-600 transition-colors"
              >
                {step.actionLabel}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ─── KPI card ────────────────────────────────────────────────────────────────

type KpiTone = "violet" | "orange" | "yellow";
const iconBg: Record<KpiTone, string> = {
  violet: "bg-biz-violet-50 text-biz-violet-600",
  orange: "bg-biz-orange-300/30 text-biz-orange-600",
  yellow: "bg-biz-yellow-300/30 text-biz-yellow-500",
};

function KpiCard({ label, value, delta, deltaTone, icon, tone }: {
  label: string; value: string; delta: string; deltaTone: "positive" | "negative"; icon: React.ReactNode; tone: KpiTone;
}) {
  return (
    <div className="rounded-3xl bg-biz-surface p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 ${iconBg[tone]}`}>{icon}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold flex-shrink-0 ${deltaTone === "positive" ? "bg-biz-green-400/15 text-biz-green-500" : "bg-red-100 text-red-600"}`}>
          {delta}
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-biz-ink">{value}</p>
      <p className="mt-1 text-xs text-biz-muted">{label}</p>
    </div>
  );
}

// ─── Goal card ───────────────────────────────────────────────────────────────

function GoalCard({ revenue, isLoading }: { revenue: number; isLoading: boolean }) {
  const goal = 1_500_000;
  const pct = Math.min(100, Math.round((revenue / goal) * 100));
  const onTrack = Math.round(pct / 10);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-biz-violet-500 via-biz-violet-600 to-biz-magenta-600 p-6 text-white shadow-lg shadow-biz-violet-500/20">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Revenue Goal</h3>
          <a href="/business/reports" className="text-xs font-medium text-white/80 hover:text-white">See all →</a>
        </div>
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-biz-orange-400 via-biz-orange-500 to-biz-pink-500 p-5 shadow-lg">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/80">Month-to-date</p>
          <p className="mt-3 font-display text-3xl font-bold">
            {isLoading ? "—" : formatINR(revenue)}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-sm">
            <span className="font-semibold">{pct}%</span>
            <span className="ml-1 text-white/80">of ₹15L goal</span>
          </p>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <span key={i} className={`h-1.5 w-3 rounded-full ${i < onTrack ? "bg-white" : "bg-white/25"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule card ───────────────────────────────────────────────────────────

function ScheduleCard({ appointments, isLoading }: { appointments: UpcomingAppointment[]; isLoading: boolean }) {
  return (
    <div className="rounded-3xl bg-biz-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-biz-ink">Today&apos;s schedule</h3>
          <p className="mt-0.5 text-xs text-biz-muted">{appointments.length} confirmed · live</p>
        </div>
        <a href="/business/calendar" className="rounded-full bg-biz-bg px-3 py-1.5 text-xs font-medium text-biz-ink hover:bg-biz-border">
          See all →
        </a>
      </div>
      {isLoading ? (
        <ul className="mt-5 space-y-2">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="h-12 animate-pulse rounded-2xl bg-biz-bg" />
          ))}
        </ul>
      ) : appointments.length === 0 ? (
        <p className="mt-8 text-center text-sm text-biz-muted">No appointments confirmed for today.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {appointments.slice(0, 8).map((apt) => {
            const svcName = apt.items[0]?.service?.name ?? "Service";
            const staffName = apt.staff?.user.fullName?.split(" ")[0] ?? "—";
            return (
              <li key={apt.id} className="flex items-center gap-3 rounded-2xl bg-biz-bg px-4 py-3">
                <span className="w-12 font-mono text-xs font-medium text-biz-muted">{formatTime(apt.startsAt)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-biz-ink">{apt.client.fullName}</p>
                  <p className="truncate text-xs text-biz-muted">{svcName} · {staffName}</p>
                </div>
                <StatusBadge status={apt.status as "confirmed" | "in_progress" | "pending"} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Alerts card ─────────────────────────────────────────────────────────────

function AlertsCard({ lowStock, newClients }: { lowStock: number; newClients: number }) {
  const alerts = [
    lowStock > 0 && { tag: "Inventory", body: `${lowStock} product${lowStock > 1 ? "s" : ""} at or below reorder level. Review stock now.` },
    newClients > 0 && { tag: "Growth", body: `${newClients} new client${newClients > 1 ? "s" : ""} joined this month. Send a welcome message?` },
    { tag: "AI insight", body: "Enable AI alerts in Phase E to get churn predictions and slot recommendations here." },
  ].filter(Boolean) as { tag: string; body: string }[];

  return (
    <div className="rounded-3xl bg-biz-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-biz-ink">Alerts</h3>
          <p className="mt-0.5 text-xs text-biz-muted">{alerts.length} items</p>
        </div>
        <span className="rounded-full bg-biz-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-biz-violet-700">
          Live
        </span>
      </div>
      <ul className="mt-5 space-y-3">
        {alerts.map((alert) => (
          <li key={alert.tag} className="rounded-2xl bg-biz-bg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">{alert.tag}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-biz-ink">{alert.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-biz-surface p-6 shadow-sm">{children}</div>;
}

function StatusBadge({ status }: { status: "confirmed" | "in_progress" | "pending" }) {
  const style = {
    in_progress: "bg-biz-green-400/15 text-biz-green-500",
    confirmed: "bg-biz-orange-300/25 text-biz-orange-600",
    pending: "bg-biz-bg text-biz-muted",
  }[status] ?? "bg-biz-bg text-biz-muted";

  const label = { in_progress: "NOW", confirmed: "CONFIRMED", pending: "PENDING" }[status] ?? status.toUpperCase();
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M8 3v3M16 3v3M3 10h18" />
    </svg>
  );
}
function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M7 5h10M7 9h10M8 13h4a4 4 0 000-8M7 13l8 7" />
    </svg>
  );
}
function ClientIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
    </svg>
  );
}
