import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getStorefrontBySlug,
  getAllStorefrontSlugs,
  isOpenNow,
  formatPrice,
  type Storefront,
} from "@/content/storefronts";
import { StorefrontPage } from "@/components/storefront/StorefrontPage";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";
import { getGooglePlace } from "@/lib/google-places";

// ISR: revalidate every 5 min; on-demand via /api/revalidate on each content change.
// Short window is a safety net so new reviews/edits surface quickly even if an
// on-demand revalidation call is missed.
export const revalidate = 300;

// Allow slugs not in generateStaticParams — render on-demand and cache via ISR.
// Without this, newly published storefronts get 404 until the next full build.
export const dynamicParams = true;

type Params = { city: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getAllStorefrontSlugs();
}

// Build a Storefront shape from the DB record + related data
async function getStorefrontFromDB(city: string, slug: string): Promise<Storefront | null> {
  try {
    const sf = await db.storefront.findFirst({
      where: { city, slug, isPublished: true },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        // Public reviews only — private feedback (1-3★, source="feedback") stays hidden.
        reviews: { where: { source: { not: "feedback" } }, orderBy: { createdAt: "desc" } },
        tenant: {
          include: {
            locations: { take: 1 },
            services: {
              where: { isActive: true },
              include: { category: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });
    if (!sf) return null;

    const tenant = sf.tenant;
    const location = tenant.locations[0];

    // Map DB photos — skip HEIC/HEIF and base64-inlined photos (not browser-renderable)
    const RENDERABLE = /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i;
    const photos = sf.photos
      .map(p => p.url)
      .filter(u => !u.startsWith("data:") && (RENDERABLE.test(u) || u.includes("supabase.co")));
    const reviews = sf.reviews.map(r => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      date: r.date,
      verified: r.verified,
    }));
    const reviewCount = reviews.length;
    const rating = reviewCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    // Group services by category
    const categoryMap: Record<string, { id: string; name: string }> = {};
    const services = tenant.services.map(svc => {
      const catName = svc.category?.name ?? "Other";
      const catId = svc.categoryId ?? catName.toLowerCase();
      if (!categoryMap[catId]) categoryMap[catId] = { id: catId, name: catName };
      return {
        id: svc.id,
        categoryId: catId,
        name: svc.name,
        durationMins: svc.durationMinutes,
        price: Number(svc.price),   // Prisma Float can serialize as Decimal object — force JS number
        priceType: (svc.priceType as "fixed" | "from" | "range" | null) ?? "fixed",
        priceMax: svc.priceMax != null ? Number(svc.priceMax) : undefined,
        description: svc.description ?? undefined,
      };
    });

    return {
      tenantId: tenant.id,
      slug: sf.slug,
      city: sf.city,
      area: sf.area,
      name: tenant.name,
      tagline: sf.tagline ?? "",
      description: sf.description ?? "",
      phone: location?.phone ?? tenant.phone ?? "",
      address: location?.address ?? "",
      geoLat: sf.geoLat ?? 0,
      geoLng: sf.geoLng ?? 0,
      mapsUrl: sf.mapsUrl ?? undefined,
      audience: (sf.audience as "men" | "women" | "unisex" | null) ?? undefined,
      rating,
      reviewCount,
      photos,
      businessType: tenant.businessType,
      priceRange: "₹₹",
      hours: (sf.openingHours as Storefront["hours"] | null) ?? {
        mon: { open: "10:00", close: "20:00" },
        tue: { open: "10:00", close: "20:00" },
        wed: { open: "10:00", close: "20:00" },
        thu: { open: "10:00", close: "20:00" },
        fri: { open: "10:00", close: "21:00" },
        sat: { open: "09:00", close: "21:00" },
        sun: { open: "10:00", close: "18:00" },
      },
      serviceCategories: Object.values(categoryMap),
      services,
      team: [],
      offers: [],
      reviews,
    };
  } catch {
    return null;
  }
}

async function resolveStorefront(city: string, slug: string): Promise<Storefront | null> {
  // Try seed data first (instant, no DB needed)
  const seed = getStorefrontBySlug(city, slug);
  if (seed) return seed;
  // Fall back to DB for dynamically published storefronts
  return getStorefrontFromDB(city, slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city, slug } = await params;
  const storefront = await resolveStorefront(city, slug);
  if (!storefront) return {};

  const topServices = storefront.services.slice(0, 3).map(s => s.name).join(", ");
  const areaLabel = storefront.area.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const cityLabel = city[0].toUpperCase() + city.slice(1);
  const typeLabel = storefront.businessType
    ? storefront.businessType[0].toUpperCase() + storefront.businessType.slice(1)
    : "Salon";
  const audLabel = storefront.audience === "men" ? "Men's " : storefront.audience === "women" ? "Women's " : "Unisex ";

  return {
    // Targets local-intent queries like "unisex salon near me in Shahunagar, Pune".
    title: `${storefront.name} — ${audLabel}${typeLabel} in ${areaLabel}, ${cityLabel}`,
    description: `${storefront.name}, a ${storefront.audience ?? ""} ${storefront.businessType ?? "salon"} in ${areaLabel}, ${cityLabel}. ${topServices ? topServices + ". " : ""}Book online with OTP-verified appointments on Clitell.`,
    keywords: [
      `${storefront.businessType ?? "salon"} in ${areaLabel}`,
      `${storefront.businessType ?? "salon"} near me ${cityLabel}`,
      `${audLabel.trim()} ${storefront.businessType ?? "salon"} ${cityLabel}`,
      ...storefront.services.slice(0, 5).map(s => `${s.name} ${areaLabel}`),
    ],
    openGraph: {
      title: storefront.name,
      description: storefront.tagline,
      images: storefront.photos[0] ? [storefront.photos[0]] : [],
      type: "website",
      locale: "en_IN",
    },
    alternates: { canonical: absoluteUrl(`/${city}/${slug}`) },
    robots: { index: true, follow: true },
  };
}

function buildJsonLd(storefront: Storefront) {
  const areaLabel = storefront.area.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const cityLabel = storefront.city[0].toUpperCase() + storefront.city.slice(1);
  const daysMap: Record<string, string> = { mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday" };

  const openingHours = (Object.entries(storefront.hours) as [keyof typeof storefront.hours, {open:string;close:string;closed?:boolean}][])
    .filter(([,h]) => !h.closed)
    .map(([day,h]) => ({ "@type":"OpeningHoursSpecification", dayOfWeek:`https://schema.org/${daysMap[day]}`, opens:h.open, closes:h.close }));

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: storefront.name,
    description: storefront.description,
    image: storefront.photos,
    telephone: storefront.phone,
    address: { "@type":"PostalAddress", streetAddress:storefront.address, addressLocality:areaLabel, addressRegion:cityLabel, addressCountry:"IN" },
    geo: { "@type":"GeoCoordinates", latitude:storefront.geoLat, longitude:storefront.geoLng },
    url: absoluteUrl(`/${storefront.city}/${storefront.slug}`),
    ...(storefront.audience ? {
      audience: { "@type": "PeopleAudience", audienceType:
        storefront.audience === "unisex" ? "Men and Women" : storefront.audience === "men" ? "Men" : "Women" },
    } : {}),
    ...(storefront.reviewCount > 0 ? { aggregateRating: { "@type":"AggregateRating", ratingValue:storefront.rating.toString(), reviewCount:storefront.reviewCount.toString() } } : {}),
    priceRange: storefront.priceRange,
    openingHoursSpecification: openingHours,
    hasOfferCatalog: { "@type":"OfferCatalog", name:"Services", itemListElement: storefront.services.map(svc => ({ "@type":"Offer", itemOffered:{"@type":"Service",name:svc.name}, price:svc.price.toString(), priceCurrency:"INR" })) },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { city, slug } = await params;
  const storefront = await resolveStorefront(city, slug);
  if (!storefront) notFound();

  const jsonLd = buildJsonLd(storefront);
  const isOpen = isOpenNow(storefront.hours);
  const pricesFrom = storefront.services.length > 0 ? Math.min(...storefront.services.map(s => s.price)) : 0;

  // Live Google rating + reviews (compliant: shown with attribution, links to Google).
  // Only for real DB-backed storefronts (seed/demo storefronts have no tenantId).
  let google = null;
  if (storefront.tenantId) {
    let sfRow: { mapsUrl: string | null; googleReviewUrl: string | null } | null = null;
    try {
      sfRow = await db.storefront.findFirst({
        where: { city, slug, isPublished: true },
        select: { mapsUrl: true, googleReviewUrl: true },
      });
    } catch { sfRow = null; }
    const cityLabel = city[0].toUpperCase() + city.slice(1);
    const nameQuery = [storefront.name, storefront.address, storefront.area, cityLabel]
      .filter(Boolean).join(", ");
    google = await getGooglePlace({
      reviewUrl: sfRow?.googleReviewUrl,
      mapsUrl: sfRow?.mapsUrl,
      nameQuery,
    });
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StorefrontPage storefront={storefront} isOpen={isOpen} pricesFrom={pricesFrom} pricesFromLabel={formatPrice(pricesFrom)} google={google} />
    </>
  );
}
