"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes. The Starter plan is free forever for solo professionals — one staff seat, basic booking and billing, and up to 50 appointments a month. No card needed. Upgrade only when you need more.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are live in under 15 minutes. Our guided wizard walks you through services, staff, working hours, and GST settings. We import data from spreadsheets too — message us and we'll do it for you.",
  },
  {
    q: "Do I need separate apps for my staff and my clients?",
    a: "Yes, and they're both included. Staff get the Glamify Business app for schedule and quick billing. Your clients get the Glamify consumer app — branded with your salon's name on paid plans.",
  },
  {
    q: "Does Glamify handle GST invoicing?",
    a: "Built in. Configure your GSTIN once and every invoice is GST-compliant with HSN codes, CGST/SGST breakup, and digital signatures. Export reports for your CA in one click.",
  },
  {
    q: "Which payment methods do you support?",
    a: "UPI via Razorpay is integrated at launch — QR codes, payment links, and webhook reconciliation. Cash, card, and wallet tracking is also available. International payments are on the roadmap.",
  },
  {
    q: "What about my existing client list?",
    a: "Upload a CSV or Excel file and Glamify will import it with phone numbers, visit history, notes, and tags. Or we'll migrate from Dingg, Zenoti, or any other software for free during onboarding.",
  },
  {
    q: "Is my client data safe?",
    a: "Yes. Glamify is fully DPDPA-compliant. Client PII is encrypted at rest, payment data never touches our servers (PCI compliance via Razorpay), and you can export or delete data at any time.",
  },
  {
    q: "Can I switch plans later?",
    a: "Anytime, up or down. No long-term contracts, no exit fees. If you cancel, you keep read-only access to your data for 90 days and a full export anytime.",
  },
];

export function FAQ() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12">
          <div>
            <p className="eyebrow mb-6">Frequently asked</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Questions, answered.
            </h2>
            <p className="mt-6 text-base text-muted leading-relaxed">
              Can&apos;t find what you need?{" "}
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
                        transition={{
                          duration: reduceMotion ? 0 : 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-12 text-base text-muted leading-relaxed">
                          {faq.a}
                        </p>
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
