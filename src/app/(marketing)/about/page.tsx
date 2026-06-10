import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "About — The story behind Clitell",
  description:
    "We're building the operating system for India's beauty and wellness businesses. Beautiful software. Honest pricing. AI that actually helps.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Beauty in everything",
    body: "The salons we serve create beauty for a living. Our software should match. Every screen, every interaction, every animation — held to the same standard.",
  },
  {
    title: "Honest pricing",
    body: "No demo gates. No quote-based sales calls. No hidden setup fees. Free for solo professionals because they deserve good software too.",
  },
  {
    title: "India-first",
    body: "Built for the realities of Indian salons — UPI, GST, Hindi, monsoon Tuesdays, festive season inventory cycles. Not adapted from a Western product.",
  },
  {
    title: "AI that earns its keep",
    body: "We don't ship AI features for the press release. Every AI feature has to save you time or make you money. If it doesn't, it's not in the product.",
  },
];

const milestones = [
  { date: "Jan 2026", title: "Clitell founded", body: "Started with a notebook full of pain points from 30 salon visits across Mumbai." },
  { date: "Mar 2026", title: "First customers", body: "Five Bandra salons running on a private beta. Daily product calls." },
  { date: "May 2026", title: "Public beta", body: "500+ businesses signed up in the first 30 days. NPS 54." },
  { date: "Q3 2026", title: "AI features GA", body: "Churn prediction, smart scheduling, and demand forecasting available on Growth+." },
  { date: "Q4 2026", title: "Consumer app launch", body: "iOS and Android apps for end-clients with loyalty and rebooking." },
  { date: "2027", title: "Marketplace + multi-city", body: "Discovery marketplace and expansion to Tier-2 cities with vernacular language support." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow mb-8">About Clitell</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              Beautiful software for the people who create beauty.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-3xl">
              Clitell is the operating system for India&apos;s beauty and wellness
              businesses. We replace WhatsApp groups, paper registers, and clunky
              software with one platform built specifically for how salons, spas,
              and clinics actually work.
            </p>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12">
            <div>
              <p className="eyebrow mb-6">Our story</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em] leading-tight">
                Why we built this.
              </h2>
            </div>
            <div className="space-y-6 text-base sm:text-lg text-muted leading-relaxed max-w-3xl">
              <p>
                The founders spent six months visiting salons before writing a line
                of code. Pune, Mumbai, Bengaluru, Hyderabad. Single-chair shops and
                15-staff spas. The pattern was the same everywhere — beautiful
                spaces running on technology that didn&apos;t match their craft.
              </p>
              <p>
                We saw owners juggling three WhatsApp groups, two billing apps, and
                a paper register. We saw stylists missing client allergies that
                were buried in someone else&apos;s notes. We saw entire afternoons
                lost to manual SMS reminders that still didn&apos;t prevent
                no-shows.
              </p>
              <p>
                The existing software either cost too much (Dingg, Zenoti) or felt
                like an afterthought for India (Fresha). So we built Clitell.
              </p>
              <p className="text-2xl text-ink font-display font-bold uppercase tracking-[-0.02em]">
                An operating system as serious as the work it powers.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border bg-surface-2/40">
        <Container>
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-6">What we believe</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Our values.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-border bg-surface p-8">
                <h3 className="font-display text-xl font-bold text-ink mb-3">{value.title}</h3>
                <p className="text-base text-muted leading-relaxed">{value.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-6">Milestones</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Where we&apos;re going.
            </h2>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-border-strong" />
            <ul className="space-y-8">
              {milestones.map((m) => (
                <li key={m.title} className="relative pl-10">
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-brand-500 bg-background"
                  />
                  <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand-600 mb-1">
                    {m.date}
                  </p>
                  <h3 className="font-display text-xl font-bold text-ink mb-2">{m.title}</h3>
                  <p className="text-base text-muted leading-relaxed max-w-2xl">{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}
