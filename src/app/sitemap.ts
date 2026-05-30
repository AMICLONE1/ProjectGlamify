import type { MetadataRoute } from "next";
import { getBlogPostSlugs } from "@/content/blog";
import { getFeatureSlugs } from "@/content/features";
import { getSolutionSlugs } from "@/content/solutions";

const SITE_URL = "https://glamify.in";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...featureRoutes, ...solutionRoutes, ...blogRoutes];
}
