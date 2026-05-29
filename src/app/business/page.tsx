import type { Metadata } from "next";
import Link from "next/link";
import { dashboardAlerts, dashboardMetrics, dashboardSchedule } from "@/lib/business-data";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Business Dashboard — Glamify",
  description: "Live command center for bookings, billing, clients, inventory, campaigns, and staff.",
};

const toneStyles: Record<string, string> = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

export default function BusinessDashboardPage() {
  return (
    <div className="space-y-8 text-slate-100">
      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Dashboard</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                Today&apos;s command center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Monitor revenue, staff flow, booking health, and AI alerts in one place.
                Built for owners and managers who want to run the day, not guess it.
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Live now
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-white">{metric.value}</p>
                <p className={cn("mt-1 text-xs font-medium", toneStyles[metric.tone])}>{metric.trend}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">AI insight</p>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Just now</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
              Your Tuesdays are 23% underbooked vs the rest of the week. Try a Tuesday-only
              bundle to fill the 8-11 AM slots before discounting.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Schedule</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Today&apos;s bookings</h2>
            </div>
            <span className="text-xs text-slate-400">Bandra Branch · 5 of 12</span>
          </div>

          <div className="mt-5 space-y-3">
            {dashboardSchedule.map((item) => (
              <div key={`${item.time}-${item.client}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.time}</p>
                    <h3 className="mt-1 font-semibold text-white">{item.client}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {item.service} · {item.staff}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {dashboardAlerts.map((alert) => (
          <div key={alert.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{alert.meta}</p>
              <span className={cn("rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]", toneStyles[alert.tone])}>
                {alert.tone}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">{alert.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{alert.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Module overview</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Running the whole business</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Clients", "Allergy notes, spend, visit history, and family links"],
              ["Billing", "GST-ready invoices and split payments"],
              ["Inventory", "Reorder alerts and product usage tracking"],
              ["AI", "Scheduling, churn, and revenue insights"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Quick actions</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Open the next workflow</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
              9 modules
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["/business/calendar", "Open calendar"],
              ["/business/clients", "Search clients"],
              ["/business/pos", "Checkout now"],
              ["/business/inventory", "Review stock"],
              ["/business/campaigns", "Build campaign"],
              ["/business/reports", "See reports"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>{label}</span>
                <span className="text-cyan-300">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
