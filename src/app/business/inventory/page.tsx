import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { inventoryActions, inventoryHighlights, inventoryStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Inventory — Glamify Business",
  description: "Track stock, reorder thresholds, waste, and purchase orders before shortages appear.",
};

export default function BusinessInventoryPage() {
  return (
    <BusinessSectionPage
      eyebrow="Inventory"
      title="Protect service quality with stock that stays ahead"
      description="Monitor low-stock alerts, reorder queues, retail movement, and waste so the salon does not get blocked by a missing product."
      status="4 items low"
      stats={inventoryStats}
      highlights={inventoryHighlights}
      actions={inventoryActions}
      note="This module is tuned for visibility: quick stock counts, reorder prompts, and a simple purchase-order path for managers."
    />
  );
}
