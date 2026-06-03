import type { Metadata } from "next";
import { StaffBoard } from "@/components/business/staff/StaffBoard";

export const metadata: Metadata = {
  title: "Staff — Clitell Business",
  description: "Manage shifts, commissions, attendance, and swap approvals without losing the roster view.",
};

export default function BusinessStaffPage() {
  return <StaffBoard />;
}
