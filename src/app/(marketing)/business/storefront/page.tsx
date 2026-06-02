import type { Metadata } from "next";
import { StorefrontManager } from "@/components/dashboard/StorefrontManager";

export const metadata: Metadata = {
  title: "Storefront — Glamify Business",
  description: "Manage your public storefront — services, photos, reviews, and profile.",
};

export default function StorefrontPage() {
  return (
    <div className="p-4 sm:p-6">
      <StorefrontManager />
    </div>
  );
}
