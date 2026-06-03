import { Hero } from "@/components/sections/Hero";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { Intro } from "@/components/sections/Intro";
import { FeatureGallery } from "@/components/sections/FeatureGallery";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { AISection } from "@/components/sections/AISection";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { homeFaqs } from "@/content/faqs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          softwareApplicationSchema(),
          faqSchema(homeFaqs),
        ]}
      />
      <Hero />
      <LogoMarquee />
      <Intro />
      <FeatureGallery />
      <Services />
      <Process />
      <AISection />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
