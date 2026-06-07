// Google Places — fetch a salon's live Google rating + review count.
// COMPLIANCE: we only show the aggregate rating/count and link out to Google.
// We do NOT store or redisplay individual Google review text (against Google ToS).
//
// Needs GOOGLE_PLACES_API_KEY. We extract the Place ID from the salon's pasted
// Google Maps / review URL, then call the Places Details endpoint.

type PlaceRating = { rating: number; total: number; placeId: string } | null;

// Pull a Place ID out of common Google URL shapes.
export function extractPlaceId(url: string | null | undefined): string | null {
  if (!url) return null;
  // ?placeid=... or place_id:...
  const q = url.match(/[?&]place_?id=([^&]+)/i) || url.match(/place_id:([A-Za-z0-9_-]+)/);
  if (q) return decodeURIComponent(q[1]);
  // .../maps/place/.../data=...!1s0x...:0x... — the cid after :0x isn't a place_id, skip.
  // ChIJ... style ids that sometimes appear in the path
  const chij = url.match(/(ChIJ[A-Za-z0-9_-]{10,})/);
  if (chij) return chij[1];
  return null;
}

// Resolve a free-text query (salon name + area) to a Place ID via Find Place.
async function findPlaceId(query: string, key: string): Promise<string | null> {
  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" +
      `?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    return data?.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

export async function getGoogleRating(opts: {
  reviewUrl?: string | null;
  mapsUrl?: string | null;
  queryFallback?: string;
}): Promise<PlaceRating> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  let placeId = extractPlaceId(opts.reviewUrl) || extractPlaceId(opts.mapsUrl);
  if (!placeId && opts.queryFallback) {
    placeId = await findPlaceId(opts.queryFallback, key);
  }
  if (!placeId) return null;

  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } });
    const data = await res.json();
    const r = data?.result;
    if (!r || typeof r.rating !== "number") return null;
    return { rating: r.rating, total: r.user_ratings_total ?? 0, placeId };
  } catch {
    return null;
  }
}
