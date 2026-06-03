import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import { Inter, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clitell — The AI-first operating system for beauty & wellness",
    template: "%s · Clitell",
  },
  description:
    "Clitell is the all-in-one platform for salons, spas, and clinics in India — online booking, GST billing, CRM, inventory, marketing, and AI insights. Your own branded storefront, live in minutes.",
  applicationName: "Clitell",
  authors: [{ name: "Clitell", url: "https://clitell.in" }],
  creator: "Clitell",
  publisher: "Clitell Technologies Pvt Ltd",
  category: "Business Software",
  keywords: [
    "salon software India",
    "spa management software",
    "salon booking app",
    "beauty business software",
    "salon POS billing",
    "salon CRM",
    "appointment booking software",
    "salon storefront",
    "wellness business platform",
    "Clitell",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Clitell",
    title: "Clitell — The AI-first operating system for beauty & wellness",
    description:
      "Online booking, GST billing, CRM, inventory, and AI insights for India's salons, spas, and clinics — plus your own branded storefront. Start free.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@clitell",
    creator: "@clitell",
    title: "Clitell — The AI-first OS for beauty & wellness",
    description:
      "Online booking, GST billing, CRM, inventory, and AI insights for India's salons, spas, and clinics. Your own branded storefront, live in minutes.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clitell",
  },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0608" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // enables env(safe-area-inset-*) on notched devices
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
