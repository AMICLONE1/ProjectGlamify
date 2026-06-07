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

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 14 14" fill={i < Math.round(rating) ? "#ff5840" : "none"}>
          <path d="M7 1l1.545 3.13 3.455.503-2.5 2.437.59 3.44L7 8.895 3.91 10.51l.59-3.44L2 4.633l3.455-.503z" stroke={i < Math.round(rating) ? "#ff5840" : "#d9ccc1"} strokeWidth="1" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewsSection({ reviews, rating, reviewCount, city, slug, googleReviews = [], googleRating }: Props) {
  const reviewUrl = `/${city}/${slug}/review`;
  const hasAny = reviews.length > 0 || googleReviews.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 border-t border-border">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="eyebrow">Reviews</h2>
        <div className="flex items-center gap-3">
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRow rating={rating} />
              <span className="font-semibold text-ink">{rating}</span>
              <span className="text-sm text-muted">({reviewCount})</span>
            </div>
          )}
          <Link
            href={reviewUrl}
            className="rounded-full border border-brand-500 bg-white px-4 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-500 hover:text-white"
          >
            ★ Leave a review
          </Link>
        </div>
      </div>

      {!hasAny && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink">No reviews yet</p>
          <p className="mt-1 text-xs text-muted">Be the first to share your experience.</p>
          <Link href={reviewUrl} className="mt-4 inline-block rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            Write a review
          </Link>
        </div>
      )}

      {/* Google reviews — shown with attribution per Google Places terms */}
      {googleReviews.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <GoogleGlyph size={16} />
            <span className="text-sm font-semibold text-ink">From Google</span>
            {googleRating && <span className="text-xs text-muted">· {googleRating.rating.toFixed(1)} ({googleRating.total})</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {googleReviews.map((g, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {g.profilePhoto
                      ? <img src={g.profilePhoto} alt={g.author} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                      : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink">{g.author.charAt(0)}</div>}
                    <div>
                      <p className="text-sm font-semibold text-ink">{g.author}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-2"><GoogleGlyph size={10} /> {g.relativeTime}</p>
                    </div>
                  </div>
                  <StarRow rating={g.rating} size={12} />
                </div>
                <p className="text-sm leading-relaxed text-muted line-clamp-5">{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && googleReviews.length > 0 && (
        <p className="mb-3 text-sm font-semibold text-ink">More from customers</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-border bg-white p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink">
                  {review.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{review.authorName}</p>
                  <p className="text-xs text-muted-2">
                    {new Date(review.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <StarRow rating={review.rating} size={12} />
                {review.verified && (
                  <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
