import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { mobileActions, mobileHighlights, mobileStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Mobile App Preview — Glamify Business",
  description: "Preview the staff mobile experience for check-ins, payments, alerts, and offline workflows.",
};

export default function BusinessMobilePage() {
  return (
    <BusinessSectionPage
      eyebrow="Mobile app"
      title="Make the staff app useful on the floor, not just in a demo"
      description="Give the team a phone-first view for check-ins, queue updates, quick billing, and approvals when they are away from the desk."
      status="Phone preview"
      stats={mobileStats}
      highlights={mobileHighlights}
      actions={mobileActions}
      note="The mobile module is intended to mirror the day-to-day flow of the salon team: fast updates, quick actions, and strong offline support."
    />
  );
}
