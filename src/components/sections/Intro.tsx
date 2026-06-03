"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function Intro() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-8"
          >
            Why we built Clitell
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink"
          >
            Rasper and Dingg give you a POS. We give you customers.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 grid sm:grid-cols-2 gap-8 text-muted"
          >
            <p className="text-base leading-relaxed">
              India&apos;s 1.2 million salons are invisible online. When someone searches
              &ldquo;salon near me&rdquo; on Google, the results go to Justdial or Urban Company —
              not the salon itself. You lose customers to platforms that charge 25–30% commission.
            </p>
            <p className="text-base leading-relaxed">
              Clitell gives every salon a branded public storefront, a Google-indexed local page,
              and OTP-verified bookings — without taking commission. Customers book directly from
              your link. You own the relationship. Built in India, for India.
            </p>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
