import type { Metadata } from "next";
import { CalendarBoard } from "@/components/business/calendar/CalendarBoard";

export const metadata: Metadata = {
  title: "Calendar — Clitell Business",
  description: "Plan the day, balance staff, and clear the waitlist before the rush hits.",
};

export default function BusinessCalendarPage() {
  return <CalendarBoard />;
}
