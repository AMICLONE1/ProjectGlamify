"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { businessNavigation } from "@/lib/business-data";

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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04111f] text-slate-100">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_25%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-screen-2xl">
        <aside className="hidden w-80 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl lg:flex">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-lg shadow-brand-500/20">
                G
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Business platform</p>
                <h1 className="font-display text-xl font-bold text-white">Glamify Business</h1>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Live branch</p>
              <p className="mt-1 font-semibold text-white">Bandra Branch</p>
              <p className="mt-1 text-sm text-slate-300">82% occupancy · 5 appointments waiting</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {businessNavigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 transition-colors",
                    active ? "bg-white text-[#061627] shadow-lg shadow-black/20" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={cn("block text-[11px]", active ? "text-slate-700" : "text-slate-400")}>{item.description}</span>
                  </span>
                  <span className={cn("text-xs", active ? "text-cyan-600" : "text-slate-500")}>→</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">System health</p>
              <p className="mt-2 font-semibold text-white">All services online</p>
              <p className="mt-1 text-sm text-slate-300">API, realtime, and billing hooks healthy.</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#061627]/85 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>

              <div className="hidden min-w-0 flex-1 items-center md:flex">
                <div className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                  <SearchIcon />
                  <span>Search clients, bookings, invoices, campaigns...</span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 sm:inline-flex">
                  Bandra Branch
                </span>
                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#061627] bg-emerald-400" />
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
                  PS
                </div>
              </div>
            </div>
          </header>

          {menuOpen && (
            <div className="fixed inset-0 z-40 bg-[#03101e]/90 px-4 py-4 backdrop-blur-md lg:hidden">
              <div className="mx-auto flex h-full max-w-md flex-col rounded-[2rem] border border-white/10 bg-[#071a2f] p-4 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Navigation</p>
                    <p className="mt-1 font-semibold text-white">Glamify Business</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                    aria-label="Close navigation"
                    onClick={() => setMenuOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>

                <nav className="mt-4 space-y-2 overflow-y-auto pr-1">
                  {businessNavigation.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3 transition-colors",
                          active ? "bg-white text-[#061627]" : "bg-white/5 text-slate-200 hover:bg-white/10"
                        )}
                      >
                        <span>
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className={cn("block text-[11px]", active ? "text-slate-700" : "text-slate-400")}>{item.description}</span>
                        </span>
                        <span className={cn("text-xs", active ? "text-cyan-600" : "text-slate-400")}>→</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4 shrink-0">
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M15 17H9m8-2V10a5 5 0 10-10 0v5l-2 2h14l-2-2Zm-5 5a2 2 0 01-2-2h4a2 2 0 01-2 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
