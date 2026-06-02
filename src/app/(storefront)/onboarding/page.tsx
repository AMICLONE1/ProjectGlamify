import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Set up your storefront — Glamify",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
