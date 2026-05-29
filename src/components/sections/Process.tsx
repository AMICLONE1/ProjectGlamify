"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const steps = [
  { num: "01", label: "Sign up", time: "2 min", desc: "Email + phone. No card. Free forever for solo professionals." },
  { num: "02", label: "Set up", time: "10 min", desc: "Guided wizard adds your services, staff, working hours, and GST settings." },
  { num: "03", label: "Invite team", time: "3 min", desc: "Add your stylists with role-based permissions. They get the staff app." },
  { num: "04", label: "Take bookings", time: "right away", desc: "Share your booking link. Or use the receptionist dashboard for walk-ins." },
];

export function Process() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border bg-surface-2/40">
      <Container>
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-6">The 15-minute setup</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            Signup to first booking.
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
