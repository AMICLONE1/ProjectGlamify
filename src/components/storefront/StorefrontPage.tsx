"use client";

import { useState } from "react";
import type { Storefront } from "@/content/storefronts";
import { StorefrontHeader } from "./StorefrontHeader";
import { PhotoGallery } from "./PhotoGallery";
import { ServiceMenu } from "./ServiceMenu";
import { TeamSection } from "./TeamSection";
import { OffersBar } from "./OffersBar";
import { ReviewsSection } from "./ReviewsSection";
import { LocationHours } from "./LocationHours";
import { BookingModal } from "./BookingModal";

type GoogleReview = { author: string; rating: number; text: string; relativeTime: string; profilePhoto?: string };
type GooglePlace = { rating: number; total: number; reviews: GoogleReview[] } | null;

type Props = {
  storefront: Storefront;
  isOpen: boolean;
  pricesFrom: number;
  pricesFromLabel: string;
  google?: GooglePlace;
};

export function StorefrontPage({ storefront, isOpen, pricesFrom, pricesFromLabel, google }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);

  function openBooking(serviceId?: string) {
    setPreselectedServiceId(serviceId ?? null);
    setBookingOpen(true);
  }

  return (
    // pb-24 on mobile leaves room above the sticky Book CTA
    <div className="min-h-screen bg-background pb-24 sm:pb-0">

      {/* Top Clitell attribution strip */}
      <div className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm py-2 text-center text-[11px] text-muted-2">
        Powered by{" "}
        <a href="/" className="font-semibold text-brand-500 hover:underline">
          Clitell
        </a>
        <span className="mx-1.5 text-border-strong">·</span>
        OTP-verified bookings
      </div>

      <StorefrontHeader
        storefront={storefront}
        isOpen={isOpen}
        pricesFromLabel={pricesFromLabel}
        googleRating={google ? { rating: google.rating, total: google.total } : null}
        onBookClick={() => openBooking()}
      />

      <PhotoGallery photos={storefront.photos} salonName={storefront.name} />

      {storefront.description && (
        <div className="border-t border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
            <h2 className="eyebrow mb-3">About</h2>
            <p className="text-muted leading-relaxed max-w-2xl">{storefront.description}</p>
          </div>
        </div>
      )}

      <OffersBar offers={storefront.offers} loyalty={storefront.loyalty} />

      <ServiceMenu
        categories={storefront.serviceCategories}
        services={storefront.services}
        onBookService={(id) => openBooking(id)}
      />

      <TeamSection team={storefront.team} />

      <ReviewsSection
        reviews={storefront.reviews}
        rating={storefront.rating}
        reviewCount={storefront.reviewCount}
        city={storefront.city}
        slug={storefront.slug}
        googleReviews={google?.reviews ?? []}
        googleRating={google ? { rating: google.rating, total: google.total } : null}
      />

      <LocationHours storefront={storefront} />

      {/* Footer */}
      <div className="border-t border-border bg-surface-2 py-8 text-center text-xs text-muted-2">
        <p className="font-medium text-muted">{storefront.name}</p>
        <p className="mt-0.5">{storefront.address}</p>
        <p className="mt-3">
          Bookings powered by{" "}
          <a href="/" className="font-semibold text-brand-500 hover:underline">
            Clitell
          </a>
          {" "}· India&apos;s beauty &amp; wellness platform
        </p>
      </div>

      {/* Sticky bottom CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-2.5">
          <a
            href={`tel:${storefront.phone}`}
            aria-label={`Call ${storefront.name}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-white text-ink transition-colors active:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 2.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c.5 1 1.5 2 2.5 2.5l.5-.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c-1 1-2.5.5-4-1S4.5 8 3 6.5 1.5 3 2.5 2l.5-.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button
            onClick={() => openBooking()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 text-base font-semibold text-white transition-all active:scale-[0.99] active:bg-brand-600"
          >
            Book appointment
            <span className="text-sm font-medium text-white/80">· from {pricesFromLabel}</span>
          </button>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          storefront={storefront}
          preselectedServiceId={preselectedServiceId}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
