"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

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

const socials = [
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://linkedin.com", label: "LinkedIn", icon: LinkedInIcon },
  { href: "https://twitter.com", label: "X", icon: XIcon },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/business")) {
    return null;
  }

  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white/70">
      {/* Ambient gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-brand-500)_0%,transparent_60%)] opacity-[0.16] blur-3xl"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

      <Container className="relative">
        {/* CTA strip */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Run your salon like the best in the business.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Booking, billing, CRM, and AI insights — built for India&apos;s beauty &amp; wellness pros.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/book-demo"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Book a demo
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 py-14 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="Glamify home" className="inline-flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/30"
              >
                G
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">Glamify</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              India&apos;s most loved operating system for beauty and wellness businesses.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-white/70">All systems operational</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                {col.title}
              </h3>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-sm text-white/65 transition-colors hover:text-white"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Glamify Technologies Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>For salons, spas, clinics, barbershops &amp; studios.</span>
            <span aria-hidden className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
            <span className="hidden sm:inline">Made in India</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
