"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AISpark, OrbitRing } from "@/components/decor/Ornaments";

const insights = [
  { tag: "Scheduling", text: "Your Tuesdays are 23% underbooked vs the rest of the week. Try a Tuesday-only offer to fill 8–11 AM slots." },
  { tag: "Churn", text: "Ananya S. usually visits every 21 days. It's been 38. Send her a personalised re-engagement offer?" },
  { tag: "Inventory", text: "Based on upcoming bookings, you'll run out of platinum colour developer by Saturday. Reorder 4 units now." },
  { tag: "Pricing", text: "Your premium facial is priced 18% below market in Bandra. A ₹400 increase wouldn't impact your booking rate." },
];

export function AISection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div>
            <p className="eyebrow mb-6">AI that earns its keep</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Not a chatbot. A second brain.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed">
              Clitell&apos;s AI watches your bookings, billing, and client patterns —
              and tells you what to do about it. In plain English. With the numbers behind it.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                "No-show prediction",
                "Smart slot suggestions",
                "Churn alerts",
                "Demand forecasting",
                "Auto-marketing copy",
                "Anomaly detection",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="h-1 w-1 rounded-full bg-brand-500" aria-hidden />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative space-y-3">
            <OrbitRing className="pointer-events-none absolute -right-10 -top-12 hidden h-28 w-28 text-brand-300/60 lg:block" />
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={reduceMotion ? undefined : { x: -4 }}
                className="relative rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-600 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200">
                    <AISpark className="h-2.5 w-2.5" />
                    {insight.tag}
                  </span>
                  <span className="text-[10px] text-muted-2">Just now</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
