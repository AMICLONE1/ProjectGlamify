"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { businessNavigation } from "@/lib/business-data";
import { NavIcon, BellIcon, SearchIcon, type IconName } from "./icons";

export function BusinessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-biz-bg text-biz-ink">
      <div className="mx-auto flex min-h-screen max-w-screen-2xl gap-4 p-3 sm:p-4">
        <aside className="hidden w-[72px] shrink-0 lg:flex">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] w-full flex-col items-center rounded-3xl bg-biz-surface py-5 shadow-sm">
            <Link
              href="/business"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-biz-violet-500 text-lg font-bold text-white shadow-md shadow-biz-violet-500/30 hover:bg-biz-violet-600 transition-colors"
              aria-label="Glamify dashboard"
            >
              G
            </Link>

            <nav aria-label="Primary" className="mt-8 flex flex-1 flex-col items-center gap-1">
              {businessNavigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                      active
                        ? "bg-biz-violet-50 text-biz-violet-600"
                        : "text-biz-muted-2 hover:bg-biz-bg hover:text-biz-ink"
                    )}
                  >
                    <NavIcon name={item.label as IconName} />
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-biz-ink px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-biz-violet-400 to-biz-magenta-500 text-sm font-bold text-white">
              PM
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 rounded-3xl bg-biz-surface px-4 py-3 shadow-sm sm:px-5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-biz-bg text-biz-ink transition-colors hover:bg-biz-border lg:hidden"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseSvg /> : <MenuSvg />}
            </button>

            <div className="hidden min-w-0 flex-1 items-center md:flex">
              <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-biz-bg px-4 py-2.5 text-sm text-biz-muted">
                <SearchIcon className="h-4 w-4" />
                <span className="text-biz-muted-2">Search clients, bookings, invoices…</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden rounded-full bg-biz-violet-50 px-4 py-2 text-xs font-medium text-biz-violet-700 sm:inline-flex">
                Bandra Branch
              </span>
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-biz-bg text-biz-ink transition-colors hover:bg-biz-border"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-biz-surface bg-biz-orange-500" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-biz-violet-400 to-biz-magenta-500 text-sm font-bold text-white">
                PM
              </div>
            </div>
          </header>

          {menuOpen && (
            <div className="fixed inset-0 z-40 bg-black/30 px-4 py-4 backdrop-blur-sm lg:hidden">
              <div className="mx-auto flex h-full max-w-sm flex-col rounded-3xl bg-biz-surface p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-biz-border pb-4">
                  <p className="font-semibold text-biz-ink">Navigation</p>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-biz-bg text-biz-ink"
                    aria-label="Close"
                    onClick={() => setMenuOpen(false)}
                  >
                    <CloseSvg />
                  </button>
                </div>
                <nav className="mt-4 space-y-1 overflow-y-auto pr-1">
                  {businessNavigation.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                          active
                            ? "bg-biz-violet-50 text-biz-violet-700"
                            : "text-biz-ink hover:bg-biz-bg"
                        )}
                      >
                        <NavIcon name={item.label as IconName} />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          <main className="mt-4 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function MenuSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
