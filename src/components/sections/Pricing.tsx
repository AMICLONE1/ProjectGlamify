"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkle } from "@/components/decor/Ornaments";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Starter",
    price: "₹0",
    period: "forever",
    description: "For solo professionals and single-chair shops.",
    features: ["1 staff seat", "Basic booking & billing", "50 appointments / month", "Client app access"],
    cta: "Start free",
    href: "/book-demo",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "/ month",
    description: "Small salons ready to grow.",
    features: ["Up to 5 staff seats", "Unlimited appointments", "CRM + Loyalty", "Remove Clitell branding", "Basic reports"],
    cta: "Start 14-day trial",
    href: "/book-demo",
    highlight: true,
  },
  {
    name: "Professional",
    price: "₹3,999",
    period: "/ month",
    description: "Mid-size salons & spas.",
    features: ["Up to 15 staff seats", "Full AI suite", "Inventory management", "Marketing campaigns", "Multi-location (2)"],
    cta: "Start 14-day trial",
    href: "/book-demo",
    highlight: false,
  },
];

export function Pricing() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="py-20 sm:py-24 border-t border-border">
      <Container>
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-6">Honest pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
            Free to start. Affordable to grow.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed">
            No quote-based sales calls. No hidden setup fees. Pick a plan, change anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className={`relative rounded-3xl p-7 transition-shadow ${
                tier.highlight
                  ? "bg-ink text-white shadow-[0_24px_60px_rgba(13,6,8,0.18)] hover:shadow-[0_28px_70px_rgba(255,88,64,0.22)]"
                  : "border border-border bg-surface text-ink hover:shadow-[0_18px_40px_rgba(255,88,64,0.08)]"
              }`}
            >
              {tier.highlight && (
                <>
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-brand-500 text-white font-semibold whitespace-nowrap">
                    <Sparkle className="h-2.5 w-2.5" />
                    Most popular
                  </span>
                  <Sparkle className="twinkle absolute right-5 top-5 h-4 w-4 text-brand-300/80" />
                </>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold mb-1">{tier.name}</h3>
                <p className={`text-sm ${tier.highlight ? "text-white/70" : "text-muted"}`}>
                  {tier.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold">{tier.price}</span>
                <span className={`text-sm ${tier.highlight ? "text-white/70" : "text-muted"}`}>
                  {tier.period}
                </span>
              </div>

              <Button
                href={tier.href}
                variant={tier.highlight ? "primary" : "secondary"}
                className="w-full"
              >
                {tier.cta}
              </Button>

              <ul className="mt-7 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${tier.highlight ? "text-brand-300" : "text-brand-500"}`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className={tier.highlight ? "text-white" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Need Enterprise with unlimited seats, locations, and dedicated support?{" "}
          <a href="/contact" className="text-brand-600 hover:text-brand-700 underline underline-offset-4 font-medium">
            Talk to sales
          </a>
        </p>
      </Container>
    </Section>
  );
}
