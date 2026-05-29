"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

const services = [
  {
    eyebrow: "Glamify Business",
    title: "For Owners & Managers",
    blurb:
      "Web dashboard with revenue analytics, multi-location control, staff performance, inventory, and AI insights that flag what needs your attention.",
    bullets: ["Real-time KPIs", "Staff & commission engine", "AI churn alerts", "GST reports"],
    href: "/features",
  },
  {
    eyebrow: "Staff Mobile App",
    title: "For Stylists & Front Desk",
    blurb:
      "Today's schedule, walk-in queue, quick checkout, attendance, and personal performance — all on the phone in your apron pocket.",
    bullets: ["Today view", "1-tap billing", "Commission tracker", "Push reminders"],
    href: "/features",
  },
  {
    eyebrow: "Glamify Consumer App",
    title: "For Your Clients",
    blurb:
      "A beautiful app for clients to book, pay, collect loyalty points, view receipts, and rebook in one tap. White-labelled on paid plans.",
    bullets: ["OTP login", "1-tap rebook", "Loyalty wallet", "Digital receipts"],
    href: "/features",
  },
];

export function Services() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="eyebrow mb-6">Three apps, one ecosystem</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Built for everyone in your salon.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-3xl border border-border bg-surface hover:border-border-strong p-7 transition-all hover:-translate-y-0.5"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-4">
                {s.eyebrow}
              </p>
              <h3 className="font-display text-2xl font-bold leading-tight text-ink mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-6">{s.blurb}</p>

              <ul className="space-y-2 mb-6">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1 w-1 rounded-full bg-brand-500" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href={s.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Learn more <span aria-hidden>→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
