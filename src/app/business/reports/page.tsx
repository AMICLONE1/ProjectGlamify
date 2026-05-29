import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { reportActions, reportHighlights, reportStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Reports — Glamify Business",
  description: "Inspect revenue, retention, campaign performance, waste, and branch comparison in one dashboard.",
};

export default function BusinessReportsPage() {
  return (
    <BusinessSectionPage
      eyebrow="Reports"
      title="See the business the way finance and ops need it"
      description="Revenue, retention, marketing ROI, and waste are grouped so leadership can make decisions without exporting five different tools."
      status="Month to date"
      stats={reportStats}
      highlights={reportHighlights}
      actions={reportActions}
      note="The report view is built to become the monthly decision layer for owners, managers, and accountants."
    />
  );
}
