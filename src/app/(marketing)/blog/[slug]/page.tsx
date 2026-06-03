import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { blogPosts, getBlogPostBySlug, getBlogPostSlugs, getRelatedBlogPosts } from "@/content/blog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Clitell Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = getRelatedBlogPosts(post.related).filter((item) => item.slug !== post.slug);

  return (
    <>
      <section className="relative pt-16 pb-10 sm:pt-20 sm:pb-12">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-2 mb-8 font-semibold">
                <Link href="/blog" className="hover:text-ink transition-colors">
                  Blog
                </Link>
                <span>/</span>
                <span className="text-brand-600">{post.category}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {post.category}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-ink border border-border-strong">
                  {post.publishedLabel}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full bg-surface-2 text-ink border border-border-strong">
                  {post.readingTime}
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.94] text-ink max-w-4xl">
                {post.title}
              </h1>
              <p className="mt-6 text-xl sm:text-2xl text-brand-600 leading-relaxed max-w-3xl font-medium">
                {post.hero}
              </p>
              <p className="mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-3xl">
                {post.description}
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

            <aside className="lg:sticky lg:top-28 space-y-5">
              <div className="rounded-4xl border border-border-strong bg-surface p-7 shadow-sm">
                <p className="eyebrow mb-5">At a glance</p>
                <ul className="space-y-3">
                  {post.takeaways.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                      <span aria-hidden className="mt-1 shrink-0 text-brand-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {post.highlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-3xl border border-border bg-surface-2/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-2">{highlight.label}</p>
                    <p className="mt-2 font-display text-xl font-bold text-ink leading-tight">{highlight.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-4xl border border-border bg-ink p-7 text-white">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-300 mb-4">
                  Need the system, not the article?
                </p>
                <p className="text-sm leading-relaxed text-white/75">
                  Clitell gives you the booking, billing, CRM, loyalty, and AI workflows described here.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Button href="/signup" size="sm" variant="primary" className="w-full">
                    Start free
                  </Button>
                  <Button href="/book-demo" size="sm" className="w-full bg-white/10 text-white border border-white/15 hover:bg-white/15">
                    Book a demo
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Section className="py-16 sm:py-20 border-t border-border">
        <Container>
          <article className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-start">
            <div className="space-y-12">
              {post.sections.map((section) => (
                <section key={section.heading} className="space-y-5">
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-ink">
                    {section.heading}
                  </h2>
                  <div className="space-y-4 text-base sm:text-lg text-muted leading-relaxed">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.quote && (
                    <blockquote className="rounded-3xl border border-brand-200 bg-brand-50 p-6 text-lg sm:text-xl font-display font-bold leading-relaxed text-ink">
                      &ldquo;{section.quote}&rdquo;
                    </blockquote>
                  )}
                  {section.bullets && (
                    <ul className="space-y-3 rounded-3xl border border-border bg-surface p-6">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-sm sm:text-base text-foreground/85 leading-relaxed">
                          <span aria-hidden className="mt-1 shrink-0 text-brand-500 font-bold">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-4xl border border-border bg-surface p-7">
                <p className="eyebrow mb-5">More to read</p>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="block rounded-3xl border border-border bg-surface-2/40 p-5 transition-colors hover:border-border-strong"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-brand-600 font-semibold">{related.category}</p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-tight text-ink">
                        {related.title}
                      </h3>
                      <p className="mt-3 text-sm text-muted leading-relaxed">{related.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-4xl border border-border-strong bg-surface-2/60 p-7">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-600 mb-4">
                  What Clitell does
                </p>
                <ul className="space-y-3 text-sm text-muted leading-relaxed">
                  <li>Booking and calendar management</li>
                  <li>GST-ready billing and reconciliation</li>
                  <li>CRM, loyalty, and client app workflows</li>
                  <li>AI scheduling and churn insights</li>
                </ul>
              </div>
            </aside>
          </article>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20 border-t border-border bg-surface-2/35">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Operations</p>
              <p className="text-sm text-muted leading-relaxed">
                Keep front desk workflows fast and predictable.
              </p>
            </div>
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Finance</p>
              <p className="text-sm text-muted leading-relaxed">
                Remove manual billing and tax math from the checkout flow.
              </p>
            </div>
            <div className="rounded-4xl border border-border bg-surface p-7">
              <p className="eyebrow mb-4">Intelligence</p>
              <p className="text-sm text-muted leading-relaxed">
                Use AI to make better decisions, not louder dashboards.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <FinalCTA />
    </>
  );
}