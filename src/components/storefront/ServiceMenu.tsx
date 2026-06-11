"use client";

import { useState } from "react";
import type { Storefront } from "@/content/storefronts";
import { formatServicePrice, formatDuration } from "@/content/storefronts";

type Props = {
  categories: Storefront["serviceCategories"];
  services: Storefront["services"];
  onBookService: (serviceId: string) => void;
};

export function ServiceMenu({ categories, services, onBookService }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "all");

  const filtered =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.categoryId === activeCategory);

  return (
    <div className="border-t border-border bg-surface-2 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="eyebrow mb-6">Services</h2>

        {/* Category pill tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-ink text-white shadow-sm"
                  : "bg-white border border-border-strong text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Service cards grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{svc.name}</p>
                {svc.description && (
                  <p className="mt-0.5 text-sm text-muted">{svc.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {formatDuration(svc.durationMins)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-base font-bold text-ink">{formatServicePrice(svc)}</span>
                <button
                  onClick={() => onBookService(svc.id)}
                  className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
                >
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No services in this category.</p>
        )}
      </div>
    </div>
  );
}
