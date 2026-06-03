import type { Metadata } from "next";
import { InventoryBoard } from "@/components/business/inventory/InventoryBoard";

export const metadata: Metadata = {
  title: "Inventory — Clitell Business",
  description: "Track stock, reorder thresholds, waste, and purchase orders before shortages appear.",
};

export default function BusinessInventoryPage() {
  return <InventoryBoard />;
}
