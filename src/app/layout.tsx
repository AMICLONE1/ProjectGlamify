import type { Metadata } from "next";
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
  metadataBase: new URL("https://glamify.in"),
  title: {
    default: "Glamify — AI-first software for beauty & wellness businesses",
    template: "%s · Glamify",
  },
  description:
    "Run your salon, spa, or clinic on Glamify. Booking, billing, CRM, loyalty, and AI insights — built for India. Start free in under 15 minutes.",
  keywords: [
    "salon software India",
    "spa management software",
    "salon booking app",
    "beauty business software",
    "salon POS",
    "salon CRM",
    "Glamify",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://glamify.in",
    siteName: "Glamify",
    title: "Glamify — AI-first software for beauty & wellness businesses",
    description:
      "Booking, billing, CRM, loyalty, and AI insights for India's salons, spas, and clinics. Start free.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glamify — AI-first beauty & wellness software",
    description:
      "Booking, billing, CRM, loyalty, and AI insights for India's salons, spas, and clinics.",
  },
  robots: { index: true, follow: true },
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
