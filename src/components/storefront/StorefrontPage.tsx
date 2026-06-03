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

type Props = {
  storefront: Storefront;
  isOpen: boolean;
  pricesFrom: number;
  pricesFromLabel: string;
};

export function StorefrontPage({ storefront, isOpen, pricesFromLabel }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);

  function openBooking(serviceId?: string) {
    setPreselectedServiceId(serviceId ?? null);
    setBookingOpen(true);
  }

  return (
    // pb-20 on mobile leaves room above the sticky Book CTA so it never overlaps content
    <div className="min-h-screen bg-background pb-20 sm:pb-0">

      {/* Top Clitell attribution strip */}
      <div className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm py-2 text-center text-[11px] text-muted-2">
        Powered by{" "}
        <a href="https://clitell.in" className="font-semibold text-brand-500 hover:underline">
          Clitell
        </a>
        <span className="mx-1.5 text-border-strong">·</span>
        OTP-verified bookings
      </div>

      <StorefrontHeader
        storefront={storefront}
        isOpen={isOpen}
        pricesFromLabel={pricesFromLabel}
        onBookClick={() => openBooking()}
      />

      <PhotoGallery photos={storefront.photos} salonName={storefront.name} />

      {/* About */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 border-t border-border">
        <h2 className="eyebrow mb-3">About</h2>
        <p className="text-muted leading-relaxed max-w-2xl">{storefront.description}</p>
      </div>

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
      />

      <LocationHours storefront={storefront} />

      {/* Footer */}
      <div className="border-t border-border bg-surface-2 py-8 text-center text-xs text-muted-2">
        <p className="font-medium text-muted">{storefront.name}</p>
        <p className="mt-0.5">{storefront.address}</p>
        <p className="mt-3">
          Bookings powered by{" "}
          <a href="https://clitell.in" className="font-semibold text-brand-500 hover:underline">
            Clitell
          </a>
          {" "}· India&apos;s beauty &amp; wellness platform
        </p>
      </div>

      {/* Sticky bottom CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white px-4 py-3 sm:hidden">
        <button
          onClick={() => openBooking()}
          className="w-full rounded-full bg-brand-500 py-3.5 text-base font-semibold text-white transition-colors active:bg-brand-600"
        >
          Book appointment
        </button>
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
