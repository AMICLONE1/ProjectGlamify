import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { clientActions, clientHighlights, clientStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Clients — Glamify Business",
  description: "Track loyalty, spend, preferences, and lapse risk in a single CRM-style view.",
};

export default function BusinessClientsPage() {
  return (
    <BusinessSectionPage
      eyebrow="Clients"
      title="Keep every client history one tap away"
      description="Profile notes, service preferences, spending patterns, and win-back status live together so the front desk can act faster."
      status="1,248 active clients"
      stats={clientStats}
      highlights={clientHighlights}
      actions={clientActions}
      note="This module is built around retention: VIP recall, family groups, tags, and a clean rebook flow for the front desk."
    />
  );
}
