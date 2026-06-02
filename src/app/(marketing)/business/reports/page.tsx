import type { Metadata } from "next";
import { ReportsBoard } from "@/components/business/reports/ReportsBoard";

export const metadata: Metadata = {
  title: "Reports — Glamify Business",
  description: "Inspect revenue, retention, campaign performance, waste, and branch comparison in one dashboard.",
};

export default function BusinessReportsPage() {
  return <ReportsBoard />;
}
