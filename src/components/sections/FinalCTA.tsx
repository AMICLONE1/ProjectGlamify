"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SparkleField } from "@/components/decor/Ornaments";

const ctaSparkles = [
  { left: "8%", top: "18%", size: 18, delay: 0, tone: "text-brand-400/70" },
  { left: "16%", top: "68%", size: 12, delay: 1.1, tone: "text-gold-300/70" },
  { left: "84%", top: "22%", size: 16, delay: 0.6, tone: "text-gold-300/70" },
  { left: "91%", top: "62%", size: 11, delay: 1.7, tone: "text-brand-300/70" },
  { left: "70%", top: "82%", size: 9, delay: 2.3, tone: "text-brand-400/60" },
  { left: "28%", top: "10%", size: 10, delay: 2.9, tone: "text-brand-300/60" },
];

export function FinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-4xl bg-ink text-white p-12 sm:p-20 text-center"
        >
          {/* Ambient glow + twinkling sparkles */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/2 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-brand-500)_0%,transparent_60%)] opacity-20 blur-3xl"
          />
          <SparkleField sparkles={ctaSparkles} />
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-300 mb-6">
            Your storefront is waiting
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] max-w-3xl mx-auto">
            Get online. Take bookings. Own your customers.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Free storefront for every salon. OTP-verified bookings from day one.
            No commission. No app needed for customers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/book-demo" size="lg" variant="primary">
              Get started free <span aria-hidden>→</span>
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
