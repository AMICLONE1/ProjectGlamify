import type { Metadata } from "next";
import { DashboardLive } from "@/components/business/dashboard/DashboardLive";

export const metadata: Metadata = {
  title: "Dashboard — Glamify Business",
  description: "Live command center for bookings, billing, clients, inventory, campaigns, and staff.",
  robots: { index: false, follow: false },
};

export default function BusinessDashboardPage() {
  return <DashboardLive />;
}
