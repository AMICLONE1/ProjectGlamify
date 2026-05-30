import type { Metadata } from "next";
import { CampaignsBoard } from "@/components/business/campaigns/CampaignsBoard";

export const metadata: Metadata = {
  title: "Campaigns — Glamify Business",
  description: "Build push, SMS, and win-back campaigns that fill low-demand slots without blanket discounting.",
};

export default function BusinessCampaignsPage() {
  return <CampaignsBoard />;
}
