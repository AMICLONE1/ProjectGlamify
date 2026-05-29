import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { settingsActions, settingsHighlights, settingsStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Settings — Glamify Business",
  description: "Control profile, roles, integrations, and tax configuration for the business workspace.",
};

export default function BusinessSettingsPage() {
  return (
    <BusinessSectionPage
      eyebrow="Settings"
      title="Keep the operating system aligned with the business"
      description="Profile settings, access control, tax configuration, and integrations stay grouped so the workspace is easy to maintain."
      status="Workspace ready"
      stats={settingsStats}
      highlights={settingsHighlights}
      actions={settingsActions}
      note="This page becomes the control surface for branding, tax setup, roles, and platform integrations as the product grows."
    />
  );
}
