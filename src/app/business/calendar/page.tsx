import type { Metadata } from "next";
import { BusinessSectionPage } from "@/components/business/BusinessSectionPage";
import { calendarActions, calendarHighlights, calendarStats } from "@/lib/business-data";

export const metadata: Metadata = {
  title: "Calendar — Glamify Business",
  description: "Plan the day, balance staff, and clear the waitlist before the rush hits.",
};

export default function BusinessCalendarPage() {
  return (
    <BusinessSectionPage
      eyebrow="Calendar"
      title="Plan the day before the first client arrives"
      description="See the full appointment flow, shift rooms when the day changes, and use the waitlist to fill every quiet pocket."
      status="28 appointments today"
      stats={calendarStats}
      highlights={calendarHighlights}
      actions={calendarActions}
      note="The calendar view is designed for fast drag-and-drop scheduling, queue recovery, and room-level control on desktop and mobile."
    />
  );
}
