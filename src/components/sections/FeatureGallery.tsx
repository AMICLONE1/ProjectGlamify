"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type Feature = {
  eyebrow: string;
  title: string;
  blurb: string;
  visual: React.ReactNode;
  span?: string;
};

const features: Feature[] = [
  {
    eyebrow: "Online Storefront",
    title: "Your salon, live on the internet.",
    blurb:
      "A branded public page at clitell.in/your-city/your-salon. Services, prices, photos, reviews, hours — all managed from your dashboard.",
    visual: <BookingVisual />,
    span: "lg:col-span-2",
  },
  {
    eyebrow: "OTP Bookings",
    title: "Verified. Trusted. Confirmed.",
    blurb: "OTP at booking + check-in code on visit day. No ghost bookings, no no-shows.",
    visual: <POSVisual />,
  },
  {
    eyebrow: "Google SEO",
    title: "Rank on 'salon near me'.",
    blurb: "Auto-generated local SEO pages + Google Business Profile sync. Get the Website button on Google.",
    visual: <CRMVisual />,
  },
  {
    eyebrow: "Rewards & Loyalty",
    title: "Keep them coming back.",
    blurb:
      "Store-controlled loyalty programs, milestone rewards, and Clitell platform cashback to seed your first bookings.",
    visual: <LoyaltyVisual />,
    span: "lg:col-span-2",
  },
];

export function FeatureGallery() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-6">Four pillars of growth</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            From invisible to fully booked.
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`group relative rounded-3xl border border-border bg-surface overflow-hidden hover:border-border-strong transition-colors ${f.span ?? ""}`}
            >
              <div className="aspect-[16/10] sm:aspect-[16/9] relative overflow-hidden bg-surface-2 border-b border-border">
                {f.visual}
              </div>
              <div className="p-7">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-3">
                  {f.eyebrow}
                </p>
                <h3 className="font-display text-2xl font-bold leading-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{f.blurb}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function BookingVisual() {
  const slots = [
    { t: "9:00", c: "Ananya", s: "in" },
    { t: "9:30", c: "Karan", s: "ok" },
    { t: "10:00", c: "+ Available", s: "free" },
    { t: "10:30", c: "Meera", s: "ok" },
    { t: "11:00", c: "Riya", s: "ok" },
    { t: "11:30", c: "+ Available", s: "free" },
  ];
  return (
    <div className="absolute inset-0 p-6 flex flex-col gap-2 justify-center">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-2 mb-1 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
        Today · Tuesday
      </div>
      {slots.map((slot, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs
            ${
              slot.s === "in"
                ? "border-brand-500/40 bg-brand-50 text-ink"
                : slot.s === "free"
                ? "border-dashed border-border-strong bg-transparent text-muted-2"
                : "border-border bg-white text-muted"
            }`}
        >
          <span className="font-mono w-10">{slot.t}</span>
          <span className="flex-1">{slot.c}</span>
          {slot.s === "in" && (
            <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-600">now</span>
          )}
        </div>
      ))}
    </div>
  );
}

function POSVisual() {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-between">
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-muted">
          <span>Hair cut</span>
          <span>₹800</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Blow dry</span>
          <span>₹400</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>GST 18%</span>
          <span>₹216</span>
        </div>
        <div className="border-t border-border pt-1.5 flex justify-between text-ink font-semibold">
          <span>Total</span>
          <span>₹1,416</span>
        </div>
      </div>
      <div className="rounded-lg border border-brand-500/30 bg-brand-50 p-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-ink grid place-items-center">
          <div className="h-5 w-5 grid grid-cols-3 gap-px">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className={i % 2 === 0 ? "bg-white" : ""} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-2">Scan to pay via UPI</p>
          <p className="text-xs font-semibold text-brand-600">₹1,416.00</p>
        </div>
      </div>
    </div>
  );
}

function CRMVisual() {
  return (
    <div className="absolute inset-0 p-6 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-brand-500 grid place-items-center text-sm font-bold text-white">
          AS
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Ananya Sharma</p>
          <p className="text-[10px] text-muted-2">Client since Jan 2024</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Visits" value="24" />
        <Stat label="Spend" value="₹38k" />
        <Stat label="Avg" value="₹1.5k" />
      </div>
      <div className="mt-3 flex gap-1 flex-wrap">
        {["VIP", "Hair · Long", "Sensitive scalp"].map((tag) => (
          <span
            key={tag}
            className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-border-strong text-muted bg-white"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-2">
      <p className="text-[9px] uppercase font-semibold text-muted-2">{label}</p>
      <p className="font-display text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function LoyaltyVisual() {
  return (
    <div className="absolute inset-0 p-6 flex items-center justify-center gap-6">
      <div className="rounded-2xl bg-ink p-5 w-56 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <span className="font-display font-bold lowercase text-white text-lg">clitell</span>
          <span className="text-[9px] uppercase tracking-wider text-brand-300 font-semibold">Gold</span>
        </div>
        <p className="text-[10px] text-white/60">Points balance</p>
        <p className="font-display text-2xl font-bold text-white">2,840</p>
        <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-3/4 bg-brand-500" />
        </div>
        <p className="text-[9px] text-white/60 mt-1">160 to Platinum</p>
      </div>
      <div className="space-y-2 text-xs">
        <Badge>+50 pts · Visit</Badge>
        <Badge>-200 pts · Reward</Badge>
        <Badge>+100 pts · Referral</Badge>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 rounded-full border border-border bg-white text-muted whitespace-nowrap">
      {children}
    </div>
  );
}
