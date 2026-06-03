"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

const faqs = [
  { q: "Is the free plan really free forever?", a: "Yes. The Starter plan stays free with no time limit and no card required. It's designed for solo professionals — one staff seat, up to 50 appointments per month, basic booking and billing, and access to the consumer app for your clients." },
  { q: "Can I switch plans later?", a: "Anytime. Upgrade instantly when you need more seats or AI features. Downgrade at the end of any billing cycle with no penalty. Your data and history stay intact." },
  { q: "Do you offer annual billing discounts?", a: "Yes — pay annually and save 20% across all paid tiers. Growth annual works out to ₹1,199/month equivalent, Professional to ₹3,199/month equivalent." },
  { q: "What happens if I exceed the Starter plan's 50 appointments?", a: "We'll prompt you to upgrade when you hit 45 appointments. If you exceed 50, bookings continue to work but you'll see a friendly upgrade banner. We don't cut you off mid-day." },
  { q: "Are payment processing fees included?", a: "Razorpay's standard UPI processing rates apply directly to your transactions (no markup from us on Growth and Professional). Enterprise plans can negotiate bulk rates with Razorpay through us." },
  { q: "How does the 14-day trial work for paid plans?", a: "Click 'Start free trial' on any paid plan, set up your business, and use all features for 14 days. No card required to start. If you don't subscribe, we'll automatically convert you to the free Starter plan with your data intact." },
  { q: "What about WhatsApp Business API and SMS?", a: "These run through third-party gateways (charged per message) and are available as paid add-ons on Growth and Professional. Enterprise plans include a base allotment. Pricing varies by message volume." },
  { q: "Do you offer non-profit or small business discounts?", a: "Registered non-profits and women-led salons in Tier-2/3 cities get 30% off paid plans for the first year. Email hello@clitell.in with proof of registration." },
];

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
