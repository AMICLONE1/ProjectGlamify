"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";

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

// Max tilt in degrees at the card edges.
const TILT = 7;

export function HeroPreview() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Springed tilt angles (degrees) driven by pointer position.
  const rotY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18, mass: 0.6 });
  const rotX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18, mass: 0.6 });
  // Sheen horizontal position (%), follows the pointer.
  const sheen = useSpring(useMotionValue(50), { stiffness: 120, damping: 20 });

  const transform = useMotionTemplate`perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  const sheenBg = useMotionTemplate`radial-gradient(38rem 30rem at ${sheen}% -10%, rgba(255,255,255,0.16), transparent 60%)`;

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1
    rotY.set((nx - 0.5) * 2 * TILT); // horizontal pointer → rotateY
    rotX.set((0.5 - ny) * 2 * TILT); // vertical pointer → rotateX (inverted)
    sheen.set(nx * 100);
  }

  function handlePointerLeave() {
    rotY.set(0);
    rotX.set(0);
    sheen.set(50);
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl" style={{ perspective: 1400 }}>
      {/* Ambient gradient glow behind the card */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.75rem] opacity-70 blur-2xl bg-[linear-gradient(130deg,var(--color-brand-500)_0%,transparent_45%,var(--color-plum-700)_100%)]"
        animate={
          reduceMotion ? undefined : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.02, 1] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={reduceMotion ? undefined : { transform, transformStyle: "preserve-3d" }}
        className="relative will-change-transform"
      >
        {/* Inner gradient border highlight */}
        <div
          aria-hidden
          className="absolute -inset-px rounded-4xl bg-linear-to-b from-brand-500/30 via-transparent to-plum-700/20"
        />

        {/* Pointer-tracking sheen */}
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-4xl mix-blend-soft-light"
            style={{ background: sheenBg }}
          />
        )}

        <div className="relative overflow-hidden rounded-4xl border border-border-strong bg-surface/85 shadow-2xl shadow-brand-900/10 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 border-b border-border bg-background/75 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
            <span className="ml-3 text-xs font-mono text-muted">app.clitell.in/dashboard</span>
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

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-plum-700 text-xs font-bold text-white">
                  AS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">Churn alert</p>
                  <p className="truncate text-sm text-foreground">Ananya S. usually visits every 21 days · 38 days now</p>
                </div>
                <button className="shrink-0 text-xs font-medium text-brand-500">Re-engage</button>
              </div>
            </div>

            {/* Schedule column — hidden on mobile to match the compact phone view */}
            <div className="hidden p-5 sm:p-6 lg:block">
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
      </motion.div>
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
      className={`min-w-0 rounded-2xl border p-2.5 sm:p-3 ${
        highlight ? "border-brand-500/30 bg-brand-500/5" : "border-border bg-surface-2/40"
      }`}
    >
      <p className="truncate text-[9px] uppercase tracking-wider text-muted sm:text-[10px]">{label}</p>
      <p className="mt-1 font-display text-base font-bold leading-tight text-foreground sm:text-xl">{value}</p>
      <p className={`mt-0.5 truncate text-[10px] font-medium ${highlight ? "text-brand-500" : "text-gold-400"}`}>
        {trend}
      </p>
    </div>
  );
}
