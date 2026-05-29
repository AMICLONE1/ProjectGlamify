import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { campaignActions, campaignHighlights, campaignStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Campaigns — Glamify Business",
  description: "Build push, SMS, and win-back campaigns that fill low-demand slots without blanket discounting.",
};

export default function BusinessCampaignsPage() {
  return (
    <BusinessSectionPage
      eyebrow="Campaigns"
      title="Use campaigns to fill the right slots, not every slot"
      description="Run birthday, win-back, and off-peak push campaigns from one place with segments that stay easy to read."
      status="4 automations live"
      stats={campaignStats}
      highlights={campaignHighlights}
      actions={campaignActions}
      note="The campaigns module focuses on lifecycle marketing: rebook reminders, birthday offers, and targeted fills for slow days."
    />
  );
}
