import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { posActions, posHighlights, posStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "POS — Glamify Business",
  description: "Close bills quickly, support split payments, and keep GST-ready invoicing clean.",
};

export default function BusinessPosPage() {
  return (
    <BusinessSectionPage
      eyebrow="POS"
      title="Turn service completion into a clean checkout"
      description="Billing, payments, invoices, and retail add-ons sit together so the team can close out the visit without friction."
      status="₹42,800 today"
      stats={posStats}
      highlights={posHighlights}
      actions={posActions}
      note="The POS flow is designed for speed: one cart, multiple payment methods, and a GST-safe invoice generated at the end of the visit."
    />
  );
}
