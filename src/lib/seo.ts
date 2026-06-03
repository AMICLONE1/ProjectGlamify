// Centralised SEO helpers: structured-data (JSON-LD) builders + shared org constants.
//
// These power rich results in Google (sitelinks search box, org knowledge panel,
// software app rating snippet, FAQ accordions, breadcrumbs). All URLs derive from
// SITE_URL so they stay correct across the Vercel domain and a future custom domain.

import { SITE_URL, absoluteUrl } from "@/lib/site";

export const ORG = {
  name: "Clitell",
  legalName: "Clitell Technologies Pvt Ltd",
  url: SITE_URL,
  logo: absoluteUrl("/icon-512.png"),
  email: "hello@clitell.in",
  foundingDate: "2026",
  description:
    "Clitell is the AI-first operating system for India's beauty and wellness businesses — online booking, GST billing, CRM, inventory, marketing, and a branded storefront.",
  sameAs: [
    // Add real profile URLs as they go live — these strengthen entity recognition.
    "https://www.instagram.com/clitell",
    "https://www.linkedin.com/company/clitell",
    "https://twitter.com/clitell",
  ],
  areaServed: "IN",
} as const;

/** Organization — establishes the brand entity for Google's Knowledge Graph. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG.name,
    legalName: ORG.legalName,
    url: ORG.url,
    logo: { "@type": "ImageObject", url: ORG.logo, width: 512, height: 512 },
    image: ORG.logo,
    description: ORG.description,
    foundingDate: ORG.foundingDate,
    email: ORG.email,
    sameAs: ORG.sameAs,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
  };
}

/** WebSite — enables the sitelinks search box and names the site entity. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG.name,
    description: ORG.description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  };
}

/** SoftwareApplication — eligible for the app rating/price rich snippet. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Clitell",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Salon & Spa Management Software",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description: ORG.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free Starter plan for solo professionals. Paid plans from ₹1,499/month.",
    },
    featureList: [
      "Online appointment booking",
      "GST-compliant POS billing",
      "Client CRM & loyalty",
      "Inventory management",
      "WhatsApp & SMS marketing campaigns",
      "Branded online storefront",
      "AI scheduling & insights",
      "Multi-location support",
    ],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** FAQPage — renders the expandable FAQ rich result under your listing. */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Article — eligible for the article rich result (headline, date, author, image). */
export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? absoluteUrl(post.image) : ORG.logo,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: ORG.name, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}`) },
    inLanguage: "en-IN",
  };
}

/** BreadcrumbList — shows the breadcrumb trail in search results. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
