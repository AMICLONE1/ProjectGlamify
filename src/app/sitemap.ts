import type { MetadataRoute } from "next";
import { getBlogPostSlugs } from "@/content/blog";
import { getFeatureSlugs } from "@/content/features";
import { getSolutionSlugs } from "@/content/solutions";
import { getAllStorefrontSlugs } from "@/content/storefronts";
import { SITE_URL } from "@/lib/site";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, frequency: "monthly" as const },
    { path: "/features", priority: 0.8, frequency: "monthly" as const },
    { path: "/about", priority: 0.6, frequency: "monthly" as const },
    { path: "/contact", priority: 0.6, frequency: "monthly" as const },
    { path: "/signup", priority: 0.7, frequency: "monthly" as const },
    { path: "/book-demo", priority: 0.7, frequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, frequency: "yearly" as const },
    { path: "/terms", priority: 0.3, frequency: "yearly" as const },
    { path: "/blog", priority: 0.8, frequency: "weekly" as const },
  ].map(({ path, priority, frequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: frequency,
    priority,
  }));

  const featureRoutes: MetadataRoute.Sitemap = getFeatureSlugs().map((slug) => ({
    url: `${SITE_URL}/features/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const solutionRoutes: MetadataRoute.Sitemap = getSolutionSlugs().map((slug) => ({
    url: `${SITE_URL}/solutions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogPostSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Storefronts: seed/demo entries + every published storefront in the DB.
  // DB storefronts are the real customer pages — missing them from the
  // sitemap means Google may never discover a new salon's page.
  const seedSlugs = getAllStorefrontSlugs();
  let dbSlugs: { city: string; slug: string; updatedAt: Date }[] = [];
  try {
    dbSlugs = await db.storefront.findMany({
      where: { isPublished: true },
      select: { city: true, slug: true, updatedAt: true },
    });
  } catch {
    // DB unreachable (e.g. build without env) — fall back to seed slugs only.
  }

  const seen = new Set<string>();
  const storefrontRoutes: MetadataRoute.Sitemap = [
    ...dbSlugs.map(({ city, slug, updatedAt }) => ({ city, slug, lastModified: updatedAt })),
    ...seedSlugs.map(({ city, slug }) => ({ city, slug, lastModified: now })),
  ]
    .filter(({ city, slug }) => {
      const key = `${city}/${slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ city, slug, lastModified }) => ({
      url: `${SITE_URL}/${city}/${slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  return [...staticRoutes, ...featureRoutes, ...solutionRoutes, ...blogRoutes, ...storefrontRoutes];
}
