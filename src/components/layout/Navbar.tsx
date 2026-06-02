"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/solutions/salon", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const hidePublicChrome = pathname.startsWith("/business");

  useEffect(() => {
    if (hidePublicChrome) return;

    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || isMenuOpen) {
      setIsHidden(false);
      return;
    }

    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const nearTop = currentScrollY < 24;

      setIsHidden(!nearTop);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen, hidePublicChrome]);

  useEffect(() => {
    if (!isMenuOpen || hidePublicChrome) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen, hidePublicChrome]);

  if (hidePublicChrome) {
    return null;
  }

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 pt-3 sm:pt-4 transition-all duration-300 ease-out will-change-transform",
        isHidden && "translate-y-[-120%] opacity-0 pointer-events-none"
      )}
    >
      <Container
        as="div"
        className="flex h-16 items-center justify-between gap-4 rounded-full border border-border-strong bg-surface/90 px-4 shadow-[0_18px_45px_rgba(25,16,18,0.08)] backdrop-blur-xl sm:px-6"
      >
        <Logo />

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/signup" variant="primary" size="sm">
            Get started
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-white/80 text-ink shadow-sm transition-colors hover:border-brand-300 hover:bg-white md:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          isMenuOpen ? "mt-3 max-h-128 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <Container as="div">
          <div
            id="mobile-navigation"
            className="rounded-[1.75rem] border border-border-strong bg-surface/95 p-4 shadow-[0_18px_45px_rgba(25,16,18,0.12)] backdrop-blur-xl"
          >
            <nav aria-label="Mobile primary" className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  <span>{link.label}</span>
                  <span className="text-brand-500">→</span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/login"
                onClick={closeMenu}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="inline-flex h-11 items-center justify-center rounded-full bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Get started
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
