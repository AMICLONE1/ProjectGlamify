import type { Metadata } from "next";
import { PosBoard } from "@/components/business/pos/PosBoard";

export const metadata: Metadata = {
  title: "POS — Glamify Business",
  description: "Close bills quickly, support split payments, and keep GST-ready invoicing clean.",
};

export default function BusinessPosPage() {
  return <PosBoard />;
}
