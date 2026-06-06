// Address → lat/lng geocoding via OpenStreetMap Nominatim (free, no API key).
// Nominatim usage policy: <=1 req/sec, must send a descriptive User-Agent.
// Best-effort: returns null on any failure so callers never block a save.

type GeoResult = { lat: number; lng: number };

export async function geocodeAddress(parts: {
  address?: string | null;
  area?: string | null;
  city?: string | null;
}): Promise<GeoResult | null> {
  const query = [parts.address, parts.area, parts.city, "India"]
    .map((p) => (p ?? "").toString().trim())
    .filter(Boolean)
    .join(", ");

  if (query.replace(/India/i, "").trim().length < 4) return null; // nothing meaningful to geocode

  try {
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" +
      encodeURIComponent(query);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Clitell/1.0 (salon storefront geocoding; https://clitell.vercel.app)",
        "Accept": "application/json",
      },
      // Don't let a slow geocoder hold up the user's save.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
