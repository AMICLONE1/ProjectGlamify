"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const testimonials = [
  {
    quote:
      "We switched from a paper register and three WhatsApp groups to Glamify. Our no-shows dropped 40% in two months and I finally know which services actually make me money.",
    name: "Priya Mehta",
    role: "Owner",
    business: "Studio P Salon, Bandra",
    initials: "PM",
  },
  {
    quote:
      "The AI churn alerts are uncanny. It told me a regular client was about to drop off — I sent her a personalised offer and she rebooked the same day. Worth the subscription on its own.",
    name: "Rohan Kapoor",
    role: "Manager",
    business: "Trim & Trends, Pune",
    initials: "RK",
  },
  {
    quote:
      "The staff app changed our front desk. New receptionists are productive in a day, not a week. And the consumer app means our regulars finally stopped texting me for appointments.",
    name: "Sneha Iyer",
    role: "Co-founder",
    business: "Bloom Wellness, Bengaluru",
    initials: "SI",
  },
  {
    quote:
      "We tried Dingg and Zenoti before. Glamify is the only one priced fairly for our 3-chair shop, and the interface doesn't make my stylists groan when they have to use it.",
    name: "Deepa Rao",
    role: "Owner",
    business: "Curl Story, Hyderabad",
    initials: "DR",
  },
];

export function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border bg-surface-2/40">
      <Container>
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-6">From people who run salons</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            Loved by the people who use it.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="rounded-3xl border border-border bg-surface p-8"
            >
              <div className="flex gap-0.5 mb-5 text-brand-500" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} aria-hidden>★</span>
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-ink grid place-items-center text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-muted">
                    {t.role} · {t.business}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
