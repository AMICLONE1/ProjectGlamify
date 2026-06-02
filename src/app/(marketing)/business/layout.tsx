import { BusinessShell } from "@/components/business/BusinessShell";
import { QueryProvider } from "@/components/business/QueryProvider";

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <BusinessShell>{children}</BusinessShell>
    </QueryProvider>
  );
}
