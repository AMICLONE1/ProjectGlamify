import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import {
  getFeatureBySlug,
  getFeatureSlugs,
  getRelatedFeatures,
} from "@/content/features";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getFeatureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return {};
  return {
    title: `${feature.eyebrow} — ${feature.tagline}`,
    description: feature.description,
    alternates: { canonical: `/features/${slug}` },
  };
}

export default async function FeatureDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);

  if (!feature) notFound();

  const related = getRelatedFeatures(feature.related);

  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-2 mb-8 font-semibold">
              <Link href="/features" className="hover:text-ink transition-colors">
                Features
              </Link>
              <span>/</span>
              <span className="text-brand-600">{feature.eyebrow}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                {feature.category}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-1 rounded-full bg-surface-2 text-ink border border-border-strong">
                {feature.tier}
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              {feature.title}
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-brand-600 leading-relaxed max-w-3xl font-medium">
              {feature.tagline}
            </p>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-3xl">
              {feature.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button href="/signup" size="lg" variant="primary">
                Start free <span aria-hidden>→</span>
              </Button>
              <Button href="/book-demo" variant="secondary" size="lg">
                See it in action
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12">
            <div>
              <p className="eyebrow mb-6">What you get</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em] leading-tight">
                Everything included.
              </h2>
            </div>
            <ul className="space-y-3">
              {feature.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <span aria-hidden className="shrink-0 mt-0.5 text-brand-500 font-bold text-lg">
                    ✓
                  </span>
                  <span className="text-base text-foreground leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border bg-surface-2/40">
        <Container>
          <div className="max-w-3xl mb-10">
            <p className="eyebrow mb-6">Capabilities</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em] leading-tight">
              How it actually works.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {feature.capabilities.map((cap) => (
              <div key={cap.title} className="rounded-3xl border border-border bg-surface p-7">
                <h3 className="font-display text-lg font-bold text-ink mb-3">{cap.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{cap.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section className="py-16 sm:py-20 border-t border-border">
          <Container>
            <div className="max-w-3xl mb-10">
              <p className="eyebrow mb-6">Pairs well with</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em] leading-tight">
                Related features.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/features/${r.slug}`}
                  className="group rounded-3xl border border-border bg-surface hover:border-border-strong p-7 transition-all hover:-translate-y-0.5"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-600 mb-3">
                    {r.eyebrow}
                  </p>
                  <h3 className="font-display text-xl font-bold text-ink leading-tight mb-3">
                    {r.title}
                  </h3>
                  <span className="text-sm font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
                    Learn more →
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <FinalCTA />
    </>
  );
}
