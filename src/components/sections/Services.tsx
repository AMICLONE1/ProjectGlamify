"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

const services = [
  {
    eyebrow: "Branded Storefront",
    title: "Your salon, online in 15 minutes.",
    blurb:
      "Every salon gets a public page at glamify.in/your-city/your-salon — shareable link, bookable instantly, no app download needed for customers.",
    bullets: ["Services menu with prices", "Photo gallery", "Customer reviews", "Offers & loyalty"],
    href: "/features",
  },
  {
    eyebrow: "OTP-Verified Bookings",
    title: "Trusted bookings, zero no-shows.",
    blurb:
      "Customers verify their phone number at booking and receive a check-in code on the day. Real visits, real accountability, real revenue.",
    bullets: ["OTP at booking", "Check-in code on day", "WhatsApp confirmations", "24h reminders"],
    href: "/features",
  },
  {
    eyebrow: "Google Growth Engine",
    title: "Show up when they search.",
    blurb:
      "Auto-generated SEO pages + Google Business Profile sync puts your salon in front of people searching 'salon near me' — without paying Urban Company.",
    bullets: ["Local SEO pages", "GBP sync", "Booking button on Google", "Review requests"],
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
            <p className="eyebrow mb-6">Everything in one platform</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Your storefront. Your customers. Your growth.
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
