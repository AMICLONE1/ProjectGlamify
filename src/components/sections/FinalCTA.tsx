"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

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
          className="rounded-[2rem] bg-ink text-white p-12 sm:p-20 text-center"
        >
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
