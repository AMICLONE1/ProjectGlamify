"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { photos: string[]; salonName: string };

export function PhotoGallery({ photos, salonName }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const visible = photos.slice(0, 5);

  if (visible.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-5">
        {visible.length === 1 ? (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80">
            <Image
              src={visible[0]}
              alt={salonName}
              fill
              className="object-cover cursor-pointer"
              onClick={() => setLightbox(0)}
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[260px] sm:h-[320px]">
            {/* Main large photo */}
            <div
              className="col-span-2 row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setLightbox(0)}
            >
              <Image
                src={visible[0]}
                alt={`${salonName} — photo 1`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 896px) 50vw, 448px"
                priority
              />
            </div>
            {/* Smaller photos grid */}
            {visible.slice(1, 5).map((src, i) => (
              <div
                key={src}
                className="relative overflow-hidden rounded-xl cursor-pointer"
                onClick={() => setLightbox(i + 1)}
              >
                <Image
                  src={src}
                  alt={`${salonName} — photo ${i + 2}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 896px) 25vw, 224px"
                />
                {/* "View all" overlay on last visible */}
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white text-sm font-semibold">
                    +{photos.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div
            className="relative h-full max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox]}
              alt={`${salonName} — photo ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          {/* Prev / next */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
                aria-label="Previous"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
                aria-label="Next"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
