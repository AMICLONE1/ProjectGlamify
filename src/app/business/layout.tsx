import { BusinessShell } from "@/components/business/BusinessShell";

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BusinessShell>{children}</BusinessShell>;
}
