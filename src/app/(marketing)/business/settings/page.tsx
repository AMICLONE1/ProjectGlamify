import type { Metadata } from "next";
import { SettingsBoard } from "@/components/business/settings/SettingsBoard";

export const metadata: Metadata = {
  title: "Settings — Clitell Business",
  description: "Control profile, roles, integrations, and tax configuration for the business workspace.",
};

export default function BusinessSettingsPage() {
  return <SettingsBoard />;
}
