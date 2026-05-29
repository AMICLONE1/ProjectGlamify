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
            The Glamify philosophy
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink"
          >
            Software as serious as your business.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 grid sm:grid-cols-2 gap-8 text-muted"
          >
            <p className="text-base leading-relaxed">
              Most salons run on WhatsApp groups, paper registers, and clunky billing apps.
              The few that use software are stuck with outdated interfaces, hidden costs,
              and zero intelligence about their own business.
            </p>
            <p className="text-base leading-relaxed">
              Glamify replaces all of it. One platform for booking, billing, clients,
              inventory, marketing, loyalty — with an AI that actually understands the
              rhythm of a beauty business. Free for solo professionals. Built in India.
            </p>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
