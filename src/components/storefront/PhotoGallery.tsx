"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { photos: string[]; salonName: string };

export function PhotoGallery({ photos, salonName }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const galleryPhotos = photos;
  const visible = galleryPhotos.slice(0, 5);
  const count = visible.length;

  if (count === 0) return null;

  function onCarouselScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const slideWidth = el.scrollWidth / galleryPhotos.length;
    setActiveSlide(Math.min(galleryPhotos.length - 1, Math.round(el.scrollLeft / slideWidth)));
  }

  return (
    <>
      {/* Mobile: full-width swipe carousel */}
      <div className="relative bg-ink/5 py-4 sm:hidden">
        <div
          onScroll={onCarouselScroll}
          className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto px-4"
        >
          {galleryPhotos.map((src, i) => (
            <div
              key={src}
              className="relative aspect-4/3 w-4/5 shrink-0 snap-center overflow-hidden rounded-2xl"
              onClick={() => setLightbox(i)}
            >
              <Image
                src={src}
                alt={`${salonName} — photo ${i + 1}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="80vw"
              />
            </div>
          ))}
        </div>
        {galleryPhotos.length > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-7 right-7 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {activeSlide + 1} / {galleryPhotos.length}
            </span>
            <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
              {galleryPhotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === i ? "w-5 bg-brand-500" : "w-1.5 bg-border-strong"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop: collage grids */}
      <div className="mx-auto hidden max-w-4xl px-4 py-5 sm:block sm:px-6">
        {count === 1 && (
          <div className="relative h-72 w-full overflow-hidden rounded-2xl">
            <Image src={visible[0]} alt={salonName} fill priority
              className="object-cover cursor-pointer" onClick={() => setLightbox(0)}
              sizes="(max-width: 896px) 100vw, 896px" />
          </div>
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-2 h-72">
            {visible.map((src, i) => (
              <div key={src} className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(i)}>
                <Image src={src} alt={`${salonName} — photo ${i + 1}`} fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 896px) 50vw, 448px" priority={i === 0} />
              </div>
            ))}
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-2 gap-2 h-72">
            <div className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(0)}>
              <Image src={visible[0]} alt={`${salonName} — photo 2`} fill priority
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 896px) 50vw, 448px" />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {visible.slice(1).map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(i + 1)}>
                  <Image src={src} alt={`${salonName} — photo ${i + 2}`} fill
                    className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                    sizes="(max-width: 896px) 25vw, 224px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {count === 4 && (
          <div className="grid grid-cols-3 gap-2 h-72">
            <div className="col-span-2 relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(0)}>
              <Image src={visible[0]} alt={`${salonName} — photo 2`} fill priority
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 896px) 66vw, 600px" />
            </div>
            <div className="grid grid-rows-3 gap-2">
              {visible.slice(1).map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(i + 1)}>
                  <Image src={src} alt={`${salonName} — photo ${i + 2}`} fill
                    className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                    sizes="(max-width: 896px) 33vw, 298px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {count >= 5 && (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-72">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(0)}>
              <Image src={visible[0]} alt={`${salonName} — photo 2`} fill priority
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 896px) 50vw, 448px" />
            </div>
            {visible.slice(1, 5).map((src, i) => (
              <div key={src} className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(i + 1)}>
                <Image src={src} alt={`${salonName} — photo ${i + 2}`} fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 896px) 25vw, 224px" />
                {i === 3 && photos.length > 6 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white text-sm font-semibold">
                    +{photos.length - 6} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}>
            <Image src={galleryPhotos[lightbox]} alt={`${salonName} — photo ${lightbox + 2}`} fill
              className="object-contain" sizes="(max-width: 768px) 100vw, 768px" />
          </div>
          {galleryPhotos.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + galleryPhotos.length) % galleryPhotos.length); }}
                aria-label="Previous">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % galleryPhotos.length); }}
                aria-label="Next">
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
