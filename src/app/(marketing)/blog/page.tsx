import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { blogPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog — Operational playbooks for beauty businesses",
  description:
    "Practical advice for salons, spas, clinics, and barbershops. Learn how to reduce no-shows, simplify billing, and use AI without the noise.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const featured = blogPosts[0];
  const secondaryPosts = blogPosts.slice(1);

  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow mb-8 justify-center">Blog</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink">
              Operational playbooks for beauty businesses.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
              Straight-talking articles for salon owners, managers, and front desk teams.
              Less hype. More useful systems.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] font-semibold text-muted-2">
              <span className="rounded-full border border-border-strong bg-surface px-4 py-2">Operations</span>
              <span className="rounded-full border border-border-strong bg-surface px-4 py-2">Finance</span>
              <span className="rounded-full border border-border-strong bg-surface px-4 py-2">Intelligence</span>
            </div>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative overflow-hidden rounded-4xl border border-border-strong bg-gradient-to-br from-brand-500/12 via-surface to-surface-2 p-8 sm:p-10 transition-all hover:-translate-y-0.5 hover:border-brand-300"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,88,64,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(154,111,68,0.12),transparent_35%)]"
              />
              <div className="relative max-w-2xl">
                <p className="eyebrow mb-6">Featured article</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-2">
                  <span className="rounded-full border border-border bg-white/70 px-2.5 py-1">{featured.category}</span>
                  <span className="rounded-full border border-border bg-white/70 px-2.5 py-1">{featured.publishedLabel}</span>
                  <span className="rounded-full border border-border bg-white/70 px-2.5 py-1">{featured.readingTime}</span>
                </div>
                <h2 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.96] text-ink">
                  {featured.title}
                </h2>
                <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-xl">
                  {featured.excerpt}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {featured.highlights.map((highlight) => (
                    <div
                      key={highlight.label}
                      className="rounded-2xl border border-border bg-white/85 px-4 py-3 shadow-sm"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-2">{highlight.label}</p>
                      <p className="mt-1 font-display text-lg font-bold text-ink">{highlight.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-600 transition-transform group-hover:translate-x-1">
                  Read article <span aria-hidden>→</span>
                </div>
              </div>
            </Link>

            <div className="grid gap-5">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-4xl border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-border-strong"
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-2">
                    <span>{post.category}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-ink">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-sm text-muted leading-relaxed">{post.excerpt}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                    Read more <span aria-hidden>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border bg-surface-2/35">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Operations</p>
              <p className="text-sm text-muted leading-relaxed">
                Reduce no-shows, speed up the front desk, and keep the schedule moving.
              </p>
            </div>
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Finance</p>
              <p className="text-sm text-muted leading-relaxed">
                Keep GST billing, reconciliation, and audit trails simple enough for a busy team.
              </p>
            </div>
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Intelligence</p>
              <p className="text-sm text-muted leading-relaxed">
                Use AI for real operational decisions, not decoration on a dashboard.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-4xl border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-border-strong"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-600">
                  {post.category}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-ink">
                  {post.title}
                </h3>
                <p className="mt-4 text-sm text-muted leading-relaxed">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] font-semibold text-muted-2">
                  <span>{post.publishedLabel}</span>
                  <span>{post.readingTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}