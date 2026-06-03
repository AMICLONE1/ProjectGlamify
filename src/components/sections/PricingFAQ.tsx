"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { pricingFaqs as faqs } from "@/content/faqs";

export function PricingFAQ() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12">
          <div>
            <p className="eyebrow mb-6">Pricing FAQ</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              The fine print.
            </h2>
            <p className="mt-6 text-base text-muted leading-relaxed">
              Still have questions?{" "}
              <a href="/contact" className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium">
                Talk to us
              </a>
              .
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full py-5 flex items-center justify-between gap-6 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-brand-600 transition-colors">
                      {faq.q}
                    </span>
                    <span
                      aria-hidden
                      className={`shrink-0 h-8 w-8 rounded-full border border-border-strong grid place-items-center text-ink transition-all ${
                        isOpen ? "rotate-45 bg-ink text-white border-ink" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-12 text-base text-muted leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
