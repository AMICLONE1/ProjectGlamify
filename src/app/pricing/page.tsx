import type { Metadata } from "next";
import { Pricing } from "@/components/sections/Pricing";
import { PricingHero } from "@/components/sections/PricingHero";
import { PricingComparison } from "@/components/sections/PricingComparison";
import { PricingFAQ } from "@/components/sections/PricingFAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "Pricing — Free to start, affordable to grow",
  description:
    "Transparent pricing for India's beauty businesses. Free forever for solo professionals. Paid plans from ₹1,499/month. No quote-based sales calls.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <Pricing />
      <PricingComparison />
      <PricingFAQ />
      <FinalCTA />
    </>
  );
}
