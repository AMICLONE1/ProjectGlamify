"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/solutions/salon", label: "For salons" },
      { href: "/solutions/spa", label: "For spas" },
      { href: "/solutions/clinic", label: "For clinics" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/book-demo", label: "Book a demo" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/business")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-surface-2/40 mt-auto">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm text-muted leading-relaxed">
              India&apos;s most loved operating system for beauty and wellness businesses.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-[0.18em] text-ink font-semibold mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} Glamify Technologies Pvt Ltd</p>
          <p>For salons, spas, clinics, barbershops & studios.</p>
        </div>
      </Container>
    </footer>
  );
}
