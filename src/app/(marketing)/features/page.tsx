import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { features, categoryOrder } from "@/content/features";

export const metadata: Metadata = {
  title: "Features — Every module, beautifully built",
  description:
    "Booking, POS, CRM, inventory, loyalty, marketing, staff, reports, and AI — explore every Glamify feature. Built for India's beauty and wellness businesses.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow mb-8 justify-center">Features</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              Every workflow, in one place.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
              Bookings, billing, CRM, inventory, loyalty, marketing, staff, and AI —
              explore every module in depth.
            </p>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20">
        <Container>
          {categoryOrder.map((category) => {
            const items = features.filter((f) => f.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="mb-16 last:mb-0">
                <div className="flex items-baseline justify-between gap-4 mb-6 pb-4 border-b border-border">
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em]">
                    {category}
                  </h2>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-2 font-semibold">
                    {items.length} {items.length === 1 ? "module" : "modules"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((feature) => (
                    <Link
                      key={feature.slug}
                      href={`/features/${feature.slug}`}
                      className="group relative rounded-3xl border border-border bg-surface hover:border-border-strong p-7 transition-all hover:-translate-y-0.5"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-3">
                        {feature.eyebrow}
                      </p>
                      <h3 className="font-display text-xl font-bold leading-tight text-ink mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        {feature.tagline}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-ink">
                          {feature.tier}
                        </span>
                        <span className="text-sm font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
                          Learn more →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}
