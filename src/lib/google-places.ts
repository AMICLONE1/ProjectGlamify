// Google Places — fetch a salon's live Google rating, review count, and recent reviews.
//
// COMPLIANCE: Google's Places API terms allow showing review content **with
// attribution** (author name, "on Google", relative time) and linking back.
// We show up to 5 Google reviews clearly marked as Google-sourced and never mix
// them silently with platform reviews. We cache responses (24h) to limit cost.
//
// Place resolution priority:
//   1. A Place ID we can parse from the salon's pasted Google link.
//   2. Find Place from Text using the salon's NAME + full ADDRESS (precise — the
//      address keeps it from matching a different business of the same name).
//
// COST CONTROL: results are cached 24h per place (Details) / 7d (Find Place),
// so a salon triggers at most ~1 call/day. On top of that, a global monthly cap
// (GOOGLE_PLACES_MONTHLY_CAP, default 10,000) keeps total spend inside Google's
// $200/mo free credit (~11.7k Place Details calls). Beyond the cap we serve the
// last cached value / no badge rather than incur charges.

import { rateLimit } from "@/lib/rate-limit";

const MONTHLY_CAP = Number(process.env.GOOGLE_PLACES_MONTHLY_CAP ?? 10000);

// True while we're still under the monthly call budget. Uses a calendar-month
// window so it resets on the 1st. Fails OPEN only if the limiter backend errors.
async function withinMonthlyBudget(): Promise<boolean> {
  const month = new Date().toISOString().slice(0, 7); // "2026-06"
  const monthMs = 31 * 24 * 60 * 60 * 1000;
  const res = await rateLimit(`places:month:${month}`, MONTHLY_CAP, monthMs);
  return res.allowed;
}

type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto?: string;
};
export type GooglePlace = {
  rating: number;
  total: number;
  placeId: string;
  reviews: GoogleReview[];
} | null;

// Parse a Place ID directly out of a Google URL when present (no HTTP call).
// Only returns a value if it looks like a real Places API place_id (ChIJ...).
// Hex CIDs (0x...:0x...) embedded in Maps URLs are NOT valid place_ids.
export function extractPlaceId(url: string | null | undefined): string | null {
  if (!url) return null;
  // ?place_id= param or place_id: in URL
  const q = url.match(/[?&]place_?id=([^&]+)/i) || url.match(/place_id:([A-Za-z0-9_-]+)/);
  if (q) return decodeURIComponent(q[1]);
  // ChIJ... Place ID embedded directly in URL
  const chij = url.match(/(ChIJ[A-Za-z0-9_-]{10,})/);
  if (chij) return chij[1];
  return null;
}

// Resolve a short Google URL (maps.app.goo.gl, share.google, goo.gl) to its
// final destination by following the redirect, then extract the Place ID.
// Returns null if the URL isn't a known short form or the redirect fails.
async function resolveShortUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  // Try direct extraction first (works for full Maps URLs)
  const direct = extractPlaceId(url);
  if (direct) return direct;
  // Only attempt HTTP follow for known short-link domains
  const isShort = /maps\.app\.goo\.gl|share\.google|goo\.gl/i.test(url);
  if (!isShort) return null;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      // Don't cache redirects — we want the real final URL
    });
    const final = res.url;
    return extractPlaceId(final);
  } catch {
    return null;
  }
}

// Resolve name + address → Place ID. Address is included so a generic salon
// name doesn't match the wrong business. locationbias improves precision.
async function findPlaceId(query: string, key: string, lat?: number, lng?: number): Promise<string | null> {
  try {
    const bias = lat && lng ? `&locationbias=circle:2000@${lat},${lng}` : "";
    const url =
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" +
      `?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id` +
      `${bias}&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 604800 } });
    const data = await res.json();
    return data?.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

export async function getGooglePlace(opts: {
  reviewUrl?: string | null;
  mapsUrl?: string | null;
  nameQuery?: string | null;
  lat?: number;
  lng?: number;
}): Promise<GooglePlace> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  // Stop calling Google once we hit the monthly budget (stays in free tier).
  // ISR's 24h cache means already-fetched salons keep showing their badge.
  if (!(await withinMonthlyBudget())) return null;

  // Short URLs (maps.app.goo.gl, share.google) redirect to full Maps URLs but
  // those contain hex CIDs, not ChIJ place IDs — so we always fall through to
  // findPlaceId which returns the canonical ChIJ ID.
  let placeId =
    (await resolveShortUrl(opts.reviewUrl ?? null)) ||
    (await resolveShortUrl(opts.mapsUrl ?? null));
  if (!placeId && opts.nameQuery && opts.nameQuery.trim().length > 4) {
    placeId = await findPlaceId(opts.nameQuery, key, opts.lat, opts.lng);
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[google-places] placeId resolved:", placeId, { reviewUrl: opts.reviewUrl, mapsUrl: opts.mapsUrl });
  }
  if (!placeId) return null;

  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=rating,user_ratings_total,reviews&reviews_sort=newest&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } });
    const data = await res.json();
    const r = data?.result;
    if (!r || typeof r.rating !== "number") return null;

    const reviews: GoogleReview[] = (r.reviews ?? [])
      .filter((rv: { text?: string }) => rv.text && rv.text.trim().length > 0)
      .slice(0, 5)
      .map((rv: { author_name: string; rating: number; text: string; relative_time_description: string; profile_photo_url?: string }) => ({
        author: rv.author_name,
        rating: rv.rating,
        text: rv.text,
        relativeTime: rv.relative_time_description,
        profilePhoto: rv.profile_photo_url,
      }));

    return { rating: r.rating, total: r.user_ratings_total ?? 0, placeId, reviews };
  } catch {
    return null;
  }
}
