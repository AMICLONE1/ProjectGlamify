import Link from "next/link";
import type { Storefront } from "@/content/storefronts";

type Props = {
  reviews: Storefront["reviews"];
  rating: number;
  reviewCount: number;
  city: string;
  slug: string;
};

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

export function ReviewsSection({ reviews, rating, reviewCount, city, slug }: Props) {
  const reviewUrl = `/${city}/${slug}/review`;

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

      {reviews.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink">No reviews yet</p>
          <p className="mt-1 text-xs text-muted">Be the first to share your experience.</p>
          <Link href={reviewUrl} className="mt-4 inline-block rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
            Write a review
          </Link>
        </div>
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
