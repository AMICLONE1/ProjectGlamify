"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, onboardingApi, type DashboardData, type DashboardCharts, type OnboardingProgress, type UpcomingAppointment } from "@/lib/api-client";
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

  const { data: charts } = useQuery<DashboardCharts>({
    queryKey: ["dashboard-charts"],
    queryFn: () => dashboardApi.charts(),
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
          {isLoading ? (
            <>
              <KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard
                label="Today's bookings"
                value={String(data?.kpis.todayAppointments ?? 0)}
                delta={`${data?.kpis.monthBookings ?? 0} this month`}
                deltaTone="positive"
                tone="violet"
                icon={<CalendarIcon />}
              />
              <KpiCard
                label="Monthly revenue"
                value={formatINR(data?.kpis.monthRevenue ?? 0)}
                delta={`${(data?.kpis.revenueChangePct ?? 0) > 0 ? "+" : ""}${data?.kpis.revenueChangePct ?? 0}% vs last month`}
                deltaTone={(data?.kpis.revenueChangePct ?? 0) >= 0 ? "positive" : "negative"}
                tone="orange"
                icon={<RevenueIcon />}
              />
              <KpiCard
                label="Total clients"
                value={String(data?.kpis.totalClients ?? 0)}
                delta={`+${data?.kpis.newClientsThisMonth ?? 0} this month`}
                deltaTone="positive"
                tone="yellow"
                icon={<ClientIcon />}
              />
            </>
          )}
        </div>
      </section>

      {/* Getting-started checklist — auto-hides once every step is done */}
      <WelcomeChecklist />

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <GoalCard revenue={data?.kpis.monthRevenue ?? 0} isLoading={isLoading} />
        <ChartCard><RevenueAreaChart series={charts?.revenueTrends} hasData={charts?.hasRevenue} /></ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ChartCard><ServiceMixDonut data={charts?.serviceMix} hasData={charts?.hasServiceMix} /></ChartCard>
        <ChartCard><BookingsBarChart data={charts?.bookingsThisWeek} hasData={charts?.hasBookings} /></ChartCard>
      </section>

      {/* Today's schedule + alerts */}
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ScheduleCard appointments={data?.upcomingToday ?? []} isLoading={isLoading} />
        <AlertsCard lowStock={data?.kpis.lowStockAlerts ?? 0} newClients={data?.kpis.newClientsThisMonth ?? 0} />
      </section>

      {isError && (
        <p className="text-center text-sm text-red-400">
          Could not load dashboard data. Please refresh the page or contact support.
        </p>
      )}
    </div>
  );
}

// ─── Getting-started checklist (real progress) ──────────────────────────────

type ChecklistStep = {
  key: string;
  done: boolean;
  title: string;
  desc: string;
  href: string;
  actionLabel: string;
  Icon: (p: { className?: string }) => React.ReactElement;
};

function WelcomeChecklist() {
  const { data, isLoading } = useQuery<OnboardingProgress>({
    queryKey: ["onboarding-progress"],
    queryFn: () => onboardingApi.progress(),
    refetchInterval: 30_000,
  });

  if (isLoading || !data) return null;

  const s = data.steps;
  const steps: ChecklistStep[] = [
    {
      key: "account",
      done: s.account,
      title: "Account created",
      desc: "Your Clitell account is set up and ready.",
      href: "/business/settings",
      actionLabel: "Account",
      Icon: UserCheckIcon,
    },
    {
      key: "profile",
      done: s.profile,
      title: "Complete your business profile",
      desc: "Add your business name, contact details, hours, and about in Settings.",
      href: "/business/settings",
      actionLabel: "Edit profile",
      Icon: StoreIcon,
    },
    {
      key: "services",
      done: s.services,
      title: "Add your services",
      desc: "List the services customers can book, with prices and durations.",
      href: "/business/storefront",
      actionLabel: "Add services",
      Icon: ScissorsIcon,
    },
    {
      key: "photos",
      done: s.photos,
      title: "Upload photos",
      desc: "Show off your space and work — the first photo becomes your cover.",
      href: "/business/storefront",
      actionLabel: "Add photos",
      Icon: PhotoIcon,
    },
    {
      key: "published",
      done: s.published,
      title: "Publish your storefront",
      desc: "Activate your public booking page so customers can find and book you.",
      href: "/business/storefront",
      actionLabel: "Publish",
      Icon: RocketIcon,
    },
    {
      key: "booking",
      done: s.booking,
      title: "Take your first booking",
      desc: "Share your link — bookings appear on your calendar automatically.",
      href: "/business/calendar",
      actionLabel: "View calendar",
      Icon: CalendarCheckIcon,
    },
  ];

  const doneCount = steps.filter((x) => x.done).length;
  const total = steps.length;

  // Fully set up → don't waste space on the checklist anymore.
  if (doneCount === total) return null;

  // The first not-done step is the "active" one (sequential focus).
  const activeKey = steps.find((x) => !x.done)?.key;

  return (
    <section className="overflow-hidden rounded-3xl bg-biz-surface shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-biz-border px-6 py-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-biz-violet-500">
            Getting started
          </p>
          <h2 className="text-lg font-bold text-biz-ink">Finish setting up Clitell</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-2 w-28 overflow-hidden rounded-full bg-biz-border sm:block">
            <div className="h-full rounded-full bg-biz-violet-500 transition-all duration-500" style={{ width: `${(doneCount / total) * 100}%` }} />
          </div>
          <span className="rounded-full bg-biz-violet-50 px-3 py-1 text-xs font-semibold text-biz-violet-700">
            {doneCount} / {total}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-biz-border">
        {steps.map((step) => {
          const isActive = step.key === activeKey;
          return (
            <li
              key={step.key}
              className={`flex items-center gap-4 px-6 transition-colors ${
                step.done ? "py-3" : isActive ? "bg-biz-violet-50/40 py-4" : "py-4"
              }`}
            >
              {/* Status indicator */}
              {step.done ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biz-green-500 text-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-biz-violet-300 bg-white text-biz-violet-600"
                      : "border-biz-border bg-biz-bg text-biz-muted-2"
                  }`}
                >
                  <step.Icon className="h-4 w-4" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${step.done ? "text-biz-muted line-through" : "text-biz-ink"}`}>
                  {step.title}
                </p>
                {!step.done && <p className="mt-0.5 text-xs text-biz-muted">{step.desc}</p>}
              </div>

              {!step.done && (
                <a
                  href={step.href}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-biz-violet-500 text-white hover:bg-biz-violet-600"
                      : "border border-biz-border text-biz-muted hover:border-biz-violet-200 hover:text-biz-ink"
                  }`}
                >
                  {step.actionLabel}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Checklist icons (premium line set) ──────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 12l2 2 4-4" />
    </svg>
  );
}
function StoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9.5 5.2 4h13.6L20 9.5M4 9.5h16M4 9.5v9.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M4 9.5a2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}
function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8 8l12 8M8 16 20 8" />
    </svg>
  );
}
function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="m4 17 5-4 4 3 3-2.5 5 4" />
    </svg>
  );
}
function RocketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 14c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14.5 4.5C17 4 20 5 20 5s1 3 .5 5.5c-1 4-5 7-9 8l-2-2c1-4 4-8 8-9Z" /><circle cx="14.5" cy="9.5" r="1.4" />
    </svg>
  );
}
function CalendarCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M8 3v3m8-3v3M3 10h18M9 15.5l2 2 3.5-3.5" />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ─── KPI skeleton ────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="rounded-3xl bg-biz-surface p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-biz-bg" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-biz-bg" />
      </div>
      <div className="mt-4 h-7 w-20 animate-pulse rounded-xl bg-biz-bg" />
      <div className="mt-2 h-3 w-28 animate-pulse rounded-full bg-biz-bg" />
    </div>
  );
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
