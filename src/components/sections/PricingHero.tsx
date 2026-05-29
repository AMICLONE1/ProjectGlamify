import { Container } from "@/components/ui/Container";

export function PricingHero() {
  return (
    <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow mb-8 justify-center">Pricing</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
            Pricing that grows with you.
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
            No demo gates. No quote-based sales calls. No hidden setup fees.
            Pick a plan that fits where you are. Change anytime.
          </p>
        </div>
      </Container>
    </section>
  );
}
