import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { QueryProvider } from "@/components/business/QueryProvider";

export const metadata: Metadata = {
  title: "Platform Admin · Clitell",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <QueryProvider>
        <AdminShell>{children}</AdminShell>
      </QueryProvider>
    </AdminGuard>
  );
}
