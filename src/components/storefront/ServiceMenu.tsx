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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h2 className="eyebrow mb-6">Services</h2>

      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "border-ink bg-ink text-white"
                : "border-border-strong bg-white text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Service list */}
      <div className="divide-y divide-border">
        {filtered.map((svc) => (
          <div
            key={svc.id}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink">{svc.name}</p>
              {svc.description && (
                <p className="mt-0.5 text-sm text-muted">{svc.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-2">{formatDuration(svc.durationMins)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-semibold text-ink whitespace-nowrap">{formatServicePrice(svc)}</span>
              <button
                onClick={() => onBookService(svc.id)}
                className="rounded-full border border-brand-500 bg-white px-4 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-500 hover:text-white"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
