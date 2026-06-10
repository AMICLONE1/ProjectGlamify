"use client";

import { useState } from "react";
import type { Storefront } from "@/content/storefronts";
import { Button } from "@/components/ui/Button";

type Props = {
  storefront: Storefront;
  isOpen: boolean;
  pricesFromLabel: string;
  googleRating?: { rating: number; total: number } | null;
  onBookClick: () => void;
};

export function StorefrontHeader({ storefront, isOpen, pricesFromLabel, googleRating, onBookClick }: Props) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: storefront.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(storefront.rating));

  return (
    <div className="bg-white border-b border-border pb-6 pt-8 sm:pb-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top row: name + share */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-2 px-3 py-0.5 text-xs font-medium text-muted uppercase tracking-[0.15em]">
                {storefront.audience && storefront.audience !== "unisex" ? `${storefront.audience}'s ` : storefront.audience === "unisex" ? "Unisex " : ""}{storefront.businessType}
              </span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-tight ${
                  isOpen
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {isOpen ? "Open now" : "Closed"}
              </span>
            </div>
            <h1 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
              {storefront.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{storefront.area.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}, {storefront.city[0].toUpperCase() + storefront.city.slice(1)}</p>
          </div>

          <button
            onClick={handleShare}
            aria-label="Share"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-white text-muted transition-colors hover:border-ink hover:text-ink"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              // Premium iOS-style share glyph: rounded tray + upward arrow.
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 6.5L12 3l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Rating + stats row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5">
              {stars.map((filled, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={filled ? "#ff5840" : "none"} className={filled ? "text-brand-500" : "text-border-strong"}>
                  <path d="M7 1l1.545 3.13 3.455.503-2.5 2.437.59 3.44L7 8.895 3.91 10.51l.59-3.44L2 4.633l3.455-.503z" stroke={filled ? "#ff5840" : "#d9ccc1"} strokeWidth="1" strokeLinejoin="round" />
                </svg>
              ))}
            </span>
            <span className="font-semibold text-ink">{storefront.rating}</span>
            <span className="text-muted">({storefront.reviewCount} reviews)</span>
          </div>
          {googleRating && (
            <>
              <span className="h-1 w-1 rounded-full bg-border-strong" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5">
                <svg width="13" height="13" viewBox="0 0 48 48" aria-hidden><path fill="#4285F4" d="M45 24c0-1.6-.1-3.1-.4-4.6H24v9.1h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1C42.7 36.9 45 31 45 24z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z"/><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>
                <span className="font-semibold text-ink">{googleRating.rating.toFixed(1)}</span>
                <span className="text-muted">on Google ({googleRating.total})</span>
              </span>
            </>
          )}
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="text-muted">{storefront.priceRange} · from {pricesFromLabel}</span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <a href={`tel:${storefront.phone}`} className="text-brand-600 hover:underline">
            {storefront.phone}
          </a>
        </div>

        {/* CTA row — desktop only; the sticky bottom bar covers Book + Call on mobile */}
        <div className="mt-5 hidden gap-3 sm:flex sm:flex-row sm:items-center">
          <Button onClick={onBookClick} size="lg" className="w-full sm:w-auto">
            Book appointment
          </Button>
          <a
            href={`tel:${storefront.phone}`}
            className="flex h-13 items-center justify-center gap-2 rounded-full border border-border-strong px-8 text-sm font-semibold text-ink transition-colors hover:border-ink sm:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c.5 1 1.5 2 2.5 2.5l.5-.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c-1 1-2.5.5-4-1S4.5 8 3 6.5 1.5 3 2.5 2l.5-.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Call to book
          </a>
        </div>
      </div>
    </div>
  );
}
