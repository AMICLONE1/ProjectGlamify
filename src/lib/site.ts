// Single source of truth for the site's public base URL.
//
// Resolution order:
//   1. NEXT_PUBLIC_APP_URL              — set this in Vercel/env to override (e.g. https://clitell.in)
//   2. VERCEL_PROJECT_PRODUCTION_URL    — auto-injected by Vercel (the prod domain, no protocol)
//   3. https://clitell.vercel.app       — sensible default for the current Vercel deployment
//
// Used for canonical URLs, OG tags, sitemap, robots, and any absolute link we generate.
// Marketing COPY that references the future brand domain (clitell.in) is intentionally
// left as-is — it's aspirational text, not a live link.

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit && /^https?:\/\//.test(explicit)) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://clitell.vercel.app";
}

export const SITE_URL = resolveSiteUrl();

/** Build an absolute URL from a path (e.g. absoluteUrl("/pune/glow") -> https://.../pune/glow). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
