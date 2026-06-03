import { BusinessShell } from "@/components/business/BusinessShell";
import { QueryProvider } from "@/components/business/QueryProvider";
import { BusinessAuthGuard } from "@/components/business/BusinessAuthGuard";

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BusinessAuthGuard>
      <QueryProvider>
        <BusinessShell>{children}</BusinessShell>
      </QueryProvider>
    </BusinessAuthGuard>
  );
}
