"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { Storefront } from "@/content/storefronts";

type GoogleReview = { author: string; rating: number; text: string; relativeTime: string; profilePhoto?: string };

type Props = {
  reviews: Storefront["reviews"];
  rating: number;
  reviewCount: number;
  city: string;
  slug: string;
  googleReviews?: GoogleReview[];
  googleRating?: { rating: number; total: number } | null;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 14 14" fill={i < Math.round(rating) ? "#ff5840" : "none"}>
          <path d="M7 1l1.545 3.13 3.455.503-2.5 2.437.59 3.44L7 8.895 3.91 10.51l.59-3.44L2 4.633l3.455-.503z"
            stroke={i < Math.round(rating) ? "#ff5840" : "#d9ccc1"} strokeWidth="1" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

function GoogleGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45 24c0-1.6-.1-3.1-.4-4.6H24v9.1h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1C42.7 36.9 45 31 45 24z"/>
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/>
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/>
    </svg>
  );
}

function ReviewCard({ authorName, rating, text, date, verified, profilePhoto, source }: {
  authorName: string; rating: number; text: string; date: string;
  verified?: boolean; profilePhoto?: string; source?: "google" | "clitell";
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {profilePhoto
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profilePhoto} alt={authorName} className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )
          }
          <div>
            <p className="text-sm font-semibold text-ink">{authorName}</p>
            <p className="text-xs text-muted-2">
              {source === "google"
                ? date
                : new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {source === "google" && <GoogleGlyph size={12} />}
          {verified && source !== "google" && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ Verified</span>
          )}
        </div>
      </div>
      <StarRow rating={rating} size={13} />
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted line-clamp-4">{text}</p>
    </div>
  );
}

export function ReviewsSection({ reviews, rating, reviewCount, city, slug, googleReviews = [], googleRating }: Props) {
  const reviewUrl = `/${city}/${slug}/review`;
  const hasAny = reviews.length > 0 || googleReviews.length > 0;
  const displayRating = googleRating ? googleRating.rating : rating;
  const displayCount = googleRating ? googleRating.total : reviewCount;

  const allCards: Array<{
    id: string; authorName: string; rating: number; text: string;
    date: string; verified?: boolean; profilePhoto?: string; source: "google" | "clitell";
  }> = [
    ...googleReviews.map((g, i) => ({ id: `g${i}`, authorName: g.author, rating: g.rating, text: g.text, date: g.relativeTime, profilePhoto: g.profilePhoto, source: "google" as const })),
    ...reviews.map(r => ({ ...r, source: "clitell" as const })),
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = allCards.length;

  function scrollTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;
    const cardWidth = (el.children[0] as HTMLElement).offsetWidth + 12; // gap-3 = 12px
    setActiveIndex(Math.min(total - 1, Math.round(el.scrollLeft / cardWidth)));
  }

  // Update active dot on resize too
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  });

  return (
    <div className="border-t border-border bg-white py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="eyebrow mb-3">Reviews</h2>
            {hasAny && displayCount > 0 && (
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-extrabold text-ink">{displayRating.toFixed(1)}</span>
                <div className="mb-1.5">
                  <StarRow rating={displayRating} size={18} />
                  <p className="mt-1 text-sm text-muted">
                    {displayCount} {displayCount === 1 ? "review" : "reviews"}
                    {googleRating && <span className="ml-1 inline-flex items-center gap-1"><GoogleGlyph size={11} /> Google</span>}
                  </p>
                </div>
              </div>
            )}
          </div>
          <Link
            href={reviewUrl}
            className="self-start rounded-full border border-border-strong bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-surface-2 sm:self-auto"
          >
            ★ Leave a review
          </Link>
        </div>

        {!hasAny && (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 px-4 py-12 text-center">
            <p className="text-sm font-medium text-ink">No reviews yet</p>
            <p className="mt-1 text-xs text-muted">Be the first to share your experience.</p>
            <Link href={reviewUrl} className="mt-4 inline-block rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Write a review
            </Link>
          </div>
        )}

        {allCards.length > 0 && (
          <>
            {/* Carousel strip */}
            <div
              ref={scrollRef}
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6"
            >
              {allCards.map((card) => (
                <div key={card.id} className="w-72 shrink-0 snap-start sm:w-80">
                  <ReviewCard {...card} />
                </div>
              ))}
            </div>

            {/* Carousel controls — prev/next arrows + dot indicators */}
            {total > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4">
                {/* Prev / Next arrows */}
                <button
                  onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  aria-label="Previous review"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-white text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {allCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollTo(i)}
                      aria-label={`Go to review ${i + 1}`}
                      className={`rounded-full transition-all duration-200 ${
                        activeIndex === i
                          ? "w-5 h-2 bg-brand-500"
                          : "w-2 h-2 bg-border-strong hover:bg-muted-2"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => scrollTo(Math.min(total - 1, activeIndex + 1))}
                  disabled={activeIndex === total - 1}
                  aria-label="Next review"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-white text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
