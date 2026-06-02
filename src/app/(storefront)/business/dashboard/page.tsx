import type { Metadata } from "next";
import { OwnerDashboard } from "@/components/onboarding/OwnerDashboard";

export const metadata: Metadata = {
  title: "Dashboard — Glamify",
  robots: { index: false, follow: false },
};

export default function BusinessDashboardPage() {
  return <OwnerDashboard />;
}
