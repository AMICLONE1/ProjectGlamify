import type { NextConfig } from "next";

// Baseline security headers applied to every response. These defend against
// clickjacking (frame-ancestors / X-Frame-Options), MIME-sniffing, referrer
// leakage, and force HTTPS via HSTS. We deliberately do NOT set a strict
// Content-Security-Policy here because the storefront injects inline JSON-LD
// and Next/Turbopack uses inline bootstrap scripts in dev; a mis-scoped CSP
// would silently break the app. (A nonce-based CSP is the correct next step
// for production hardening.)
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Lock down powerful browser features the app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
  // HSTS: force HTTPS for 2 years incl. subdomains. Harmless on localhost
  // (browsers ignore HSTS over plain http) and enforced in production.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
