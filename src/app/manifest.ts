import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clitell — Beauty & Wellness Business OS",
    short_name: "Clitell",
    description:
      "Run your salon, spa, or clinic on Clitell. Booking, billing, CRM, loyalty, and AI insights — built for India.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d0608",
    lang: "en-IN",
    categories: ["business", "productivity", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
