"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const steps = [
  { num: "01", label: "Sign up", time: "2 min", desc: "Business name, city, phone. No card. Free forever for solo professionals." },
  { num: "02", label: "Build your storefront", time: "8 min", desc: "Add services, upload photos, set opening hours. Your public page is ready." },
  { num: "03", label: "Go live", time: "1 tap", desc: "Publish your storefront. Share the link on WhatsApp, Instagram bio, visiting card." },
  { num: "04", label: "Rank on Google", time: "within days", desc: "Connect Google Business Profile. Get the 'Book' button on your Google listing." },
];

export function Process() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border bg-surface-2/40">
      <Container>
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-6">Live in 15 minutes</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            Signup to live storefront.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-display text-4xl font-extrabold text-brand-500">
                  {step.num}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                  {step.time}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">{step.label}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
