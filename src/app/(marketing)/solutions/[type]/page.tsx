import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { getSolution, getSolutionSlugs } from "@/content/solutions";
import { getFeatureBySlug } from "@/content/features";

type Params = Promise<{ type: string }>;

export function generateStaticParams() {
  return getSolutionSlugs().map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { type } = await params;
  const solution = getSolution(type);
  if (!solution) return {};
  return {
    title: `${solution.hero} — ${solution.tagline}`,
    description: solution.description,
    alternates: { canonical: `/solutions/${type}` },
  };
}

export default async function SolutionPage({ params }: { params: Params }) {
  const { type } = await params;
  const solution = getSolution(type);

  if (!solution) notFound();

  const featureDetails = solution.features
    .map((slug) => getFeatureBySlug(slug))
    .filter((f): f is NonNullable<ReturnType<typeof getFeatureBySlug>> => Boolean(f));

  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-2 mb-8 font-semibold">
              <span className="text-brand-600">Solutions</span>
              <span>/</span>
              <span>{solution.category}</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              {solution.title}
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-brand-600 leading-relaxed max-w-3xl font-medium">
              {solution.tagline}
            </p>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-3xl">
              {solution.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button href="/signup" size="lg" variant="primary">
                Start free <span aria-hidden>→</span>
              </Button>
              <Button href="/book-demo" variant="secondary" size="lg">
                Book a demo
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-6">The pain we fix</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Sound familiar?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {solution.painPoints.map((point) => (
              <div key={point.title} className="rounded-3xl border border-border bg-surface p-7">
                <h3 className="font-display text-xl font-bold text-ink mb-3">{point.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{point.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border bg-surface-2/40">
        <Container>
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-6">The features you need</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95]">
              Built for the way you work.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureDetails.map((f) => (
              <Link
                key={f.slug}
                href={`/features/${f.slug}`}
                className="group rounded-3xl border border-border bg-surface hover:border-border-strong p-7 transition-all hover:-translate-y-0.5"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-3">
                  {f.eyebrow}
                </p>
                <h3 className="font-display text-xl font-bold text-ink leading-tight mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{f.tagline}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {solution.testimonial && (
        <Section className="py-16 sm:py-20 border-t border-border">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <p className="eyebrow mb-8 justify-center">From someone like you</p>
              <blockquote className="text-2xl sm:text-3xl text-ink leading-relaxed font-display font-bold">
                &ldquo;{solution.testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-8 inline-flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-ink grid place-items-center text-sm font-bold text-white">
                  {solution.testimonial.initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-ink">{solution.testimonial.name}</p>
                  <p className="text-xs text-muted">{solution.testimonial.business}</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      )}

      <FinalCTA />
    </>
  );
}
