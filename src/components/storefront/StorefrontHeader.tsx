"use client";

import { useState } from "react";
import type { Storefront } from "@/content/storefronts";
import { Button } from "@/components/ui/Button";

type Props = {
  storefront: Storefront;
  isOpen: boolean;
  pricesFromLabel: string;
  onBookClick: () => void;
};

export function StorefrontHeader({ storefront, isOpen, pricesFromLabel, onBookClick }: Props) {
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
                {storefront.businessType}
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
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5l4 4 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M10 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5 5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8.12 6.62l-1.24.74M6.88 7.62l1.24.74" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="text-muted">{storefront.priceRange} · from {pricesFromLabel}</span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <a href={`tel:${storefront.phone}`} className="text-brand-600 hover:underline">
            {storefront.phone}
          </a>
        </div>

        {/* CTA row */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
