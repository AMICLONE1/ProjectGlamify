"use client";

import { motion, useReducedMotion } from "motion/react";

const appointments = [
  {
    time: "10:00",
    client: "Ananya S.",
    service: "Hair cut + blow dry",
    staff: "Priya",
    status: "in-progress",
  },
  {
    time: "10:30",
    client: "Karan M.",
    service: "Beard trim",
    staff: "Rohan",
    status: "confirmed",
  },
  {
    time: "11:00",
    client: "Meera J.",
    service: "Facial · 60 min",
    staff: "Sneha",
    status: "confirmed",
  },
  {
    time: "11:30",
    client: "Walk-in",
    service: "Mani + Pedi",
    staff: "Deepa",
    status: "queued",
  },
  {
    time: "12:00",
    client: "Riya K.",
    service: "Keratin treatment",
    staff: "Priya",
    status: "confirmed",
  },
];

const statusStyles: Record<string, string> = {
  "in-progress": "bg-brand-500/15 text-brand-500 border-brand-500/30",
  confirmed: "bg-gold-500/10 text-gold-400 border-gold-500/25",
  queued: "bg-muted/15 text-muted border-border-strong",
};

export function HeroPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden
        className="absolute -inset-px rounded-4xl bg-linear-to-b from-brand-500/25 via-transparent to-transparent"
      />
      <div className="relative overflow-hidden rounded-4xl border border-border-strong bg-surface/85 shadow-2xl shadow-brand-900/10 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 border-b border-border bg-background/75 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          <span className="ml-3 text-xs font-mono text-muted">app.glamify.in/dashboard</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-[1fr_1.05fr] lg:divide-x lg:divide-y-0">
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Today · Tue 28 May</p>
                <h3 className="mt-0.5 font-display text-lg font-bold">Bandra Branch</h3>
              </div>
              <span className="text-xs text-muted">9 AM – 9 PM</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Revenue" value="₹42,800" trend="+12%" highlight />
              <StatCard label="Bookings" value="38" trend="6 walk-ins" />
              <StatCard label="Avg ticket" value="₹1,127" trend="+₹85" />
            </div>

            <div className="rounded-2xl border border-border bg-surface-2/65 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-brand-500">AI insight</p>
                <span className="text-[10px] uppercase tracking-wider text-muted">Just now</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                Your Tuesdays are <span className="font-semibold text-brand-500">23% underbooked</span>{" "}
                versus the rest of the week. Try a Tuesday-only offer to fill 8–11 AM slots.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/65 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-plum-700 text-xs font-bold text-white">
                AS
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">Churn alert</p>
                <p className="truncate text-sm text-foreground">Ananya S. usually visits every 21 days · 38 days now</p>
              </div>
              <button className="shrink-0 text-xs font-medium text-brand-500">Re-engage</button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Today&apos;s schedule</h3>
              <span className="text-xs text-muted">5 of 12</span>
            </div>
            <div className="space-y-2">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={`${appointment.time}-${appointment.client}`}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/40 px-3 py-2.5 transition-colors hover:border-border-strong"
                >
                  <span className="w-12 shrink-0 font-mono text-xs text-muted">{appointment.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{appointment.client}</p>
                    <p className="truncate text-xs text-muted">
                      {appointment.service} · {appointment.staff}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${statusStyles[appointment.status]}`}
                  >
                    {appointment.status === "in-progress" ? "now" : appointment.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  highlight,
}: {
  label: string;
  value: string;
  trend: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        highlight ? "border-brand-500/30 bg-brand-500/5" : "border-border bg-surface-2/40"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{value}</p>
      <p className={`mt-0.5 text-[10px] font-medium ${highlight ? "text-brand-500" : "text-gold-400"}`}>
        {trend}
      </p>
    </div>
  );
}