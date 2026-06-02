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

export default function HomePage() {
  return (
    <>
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
