import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { staffActions, staffHighlights, staffStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Staff — Glamify Business",
  description: "Manage shifts, commissions, attendance, and swap approvals without losing the roster view.",
};

export default function BusinessStaffPage() {
  return (
    <BusinessSectionPage
      eyebrow="Staff"
      title="Keep the roster balanced and the payouts visible"
      description="Watch utilization, shift coverage, commission due, and swap approvals from the same workspace the team uses every day."
      status="14 team members"
      stats={staffStats}
      highlights={staffHighlights}
      actions={staffActions}
      note="The staff module is built for managers who need to close the day, approve changes, and keep commission math transparent."
    />
  );
}
