"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { businessNavigation } from "@/lib/business-data";
import { NavIcon, BellIcon, SearchIcon, type IconName } from "./icons";
import { getUser, signOut, type SessionUser } from "@/lib/session";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { dashboardApi, clientsApi, appointmentsApi, onboardingApi, settingsApi, type DashboardData, type OnboardingProgress } from "@/lib/api-client";
import { FullscreenPrompt } from "./FullscreenPrompt";
import { ClitellMark } from "@/components/layout/Logo";

function initialsOf(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "G";
}

export function BusinessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Keep the session alive when the installed PWA returns to the foreground.
  // While backgrounded, Supabase's auto-refresh timer is paused; on resume the
  // access token may be stale, so we proactively refresh it instead of letting
  // a request fail and bounce the user to login.
  useEffect(() => {
    async function refreshOnResume() {
      if (document.visibilityState !== "visible") return;
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase.auth.getSession();
        if (data.session) await supabase.auth.refreshSession();
      } catch { /* getFreshToken handles a truly-dead session on the next API call */ }
    }
    document.addEventListener("visibilitychange", refreshOnResume);
    return () => document.removeEventListener("visibilitychange", refreshOnResume);
  }, []);

  const { data: dashData } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
    refetchInterval: 60_000,
  });

  const { data: onboarding } = useQuery<OnboardingProgress>({
    queryKey: ["onboarding-progress"],
    queryFn: () => onboardingApi.progress(),
    staleTime: 5 * 60_000,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    staleTime: 5 * 60_000,
  });
  const salonName = settings?.profile.name?.trim() || "";

  const alerts = [
    (dashData?.kpis.lowStockAlerts ?? 0) > 0 && {
      tag: "Inventory",
      body: `${dashData!.kpis.lowStockAlerts} product${dashData!.kpis.lowStockAlerts > 1 ? "s" : ""} at or below reorder level.`,
    },
    (dashData?.kpis.newClientsThisMonth ?? 0) > 0 && {
      tag: "Growth",
      body: `${dashData!.kpis.newClientsThisMonth} new client${dashData!.kpis.newClientsThisMonth > 1 ? "s" : ""} joined this month.`,
    },
  ].filter(Boolean) as { tag: string; body: string }[];

  useEffect(() => {
    if (!notifOpen) return;
    function onOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [notifOpen]);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

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
      <FullscreenPrompt />
      <div className="mx-auto flex min-h-screen max-w-screen-2xl gap-4 p-3 sm:p-4">
        <aside className="hidden w-[72px] shrink-0 lg:flex">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] w-full flex-col items-center rounded-3xl bg-biz-surface py-5 shadow-sm">
            <Link
              href="/business"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md hover:bg-biz-surface-2 transition-colors"
              aria-label="Clitell dashboard"
            >
              <ClitellMark className="h-7 w-auto" />
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
              {user ? initialsOf(user.fullName) : "G"}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-3 z-30 flex items-center gap-3 rounded-3xl bg-biz-surface/90 px-4 py-3 shadow-sm backdrop-blur-md sm:px-5 lg:static lg:bg-biz-surface lg:backdrop-blur-none">
            {/* Mobile brand mark (drawer is opened from the bottom "More" tab) */}
            <Link
              href="/business/dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-biz-bg lg:hidden"
              aria-label="Clitell dashboard"
            >
              <ClitellMark className="h-6 w-auto" />
            </Link>

            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex flex-1 items-center gap-2 rounded-2xl bg-biz-bg px-3 py-2.5 text-sm text-biz-muted-2 transition-colors hover:bg-biz-border md:hidden"
              aria-label="Search"
            >
              <SearchIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">Search…</span>
            </button>

            <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
              {salonName && (
                <div className="hidden min-w-0 shrink-0 lg:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-biz-muted-2 leading-none">Workspace</p>
                  <p className="mt-1 max-w-56 truncate text-sm font-bold text-biz-ink leading-none" title={salonName}>{salonName}</p>
                </div>
              )}
              {salonName && <span className="hidden h-8 w-px shrink-0 bg-biz-border lg:block" />}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-biz-bg px-4 py-2.5 text-sm text-biz-muted hover:bg-biz-border transition-colors"
              >
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="text-biz-muted-2">Search clients, bookings, invoices…</span>
                <kbd className="ml-auto hidden rounded-md bg-biz-surface px-1.5 py-0.5 text-[10px] font-semibold text-biz-muted-2 sm:block">⌘K</kbd>
              </button>
            </div>
            {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {onboarding?.storefrontUrl && (
                <a
                  href={onboarding.storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 rounded-full border border-biz-border bg-biz-surface px-3 py-1.5 text-[11px] font-semibold text-biz-ink hover:border-biz-violet-300 hover:text-biz-violet-600 transition-colors sm:flex"
                  title="View your public storefront"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
                  Storefront
                </a>
              )}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-biz-bg text-biz-ink transition-colors hover:bg-biz-border"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <BellIcon className="h-4 w-4" />
                  {alerts.length > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-biz-surface bg-biz-orange-500" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-biz-border bg-biz-surface p-3 shadow-xl">
                    <div className="flex items-center justify-between px-1 pb-2">
                      <p className="text-sm font-semibold text-biz-ink">Notifications</p>
                      <span className="rounded-full bg-biz-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-biz-violet-700">
                        {alerts.length} new
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {alerts.map((alert) => (
                        <li key={alert.tag} className="rounded-xl bg-biz-bg p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">{alert.tag}</p>
                          <p className="mt-1 text-xs leading-relaxed text-biz-ink">{alert.body}</p>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="mt-3 w-full rounded-xl py-2 text-xs font-semibold text-biz-muted transition-colors hover:bg-biz-bg"
                    >
                      Dismiss all
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl p-0.5 transition-colors hover:bg-biz-bg"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-biz-violet-400 to-biz-magenta-500 text-sm font-bold text-white">
                    {user ? initialsOf(user.fullName) : "G"}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-biz-border bg-biz-surface p-2 shadow-xl">
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-biz-ink">{user?.fullName ?? "Account"}</p>
                        <p className="truncate text-xs text-biz-muted">{user?.email ?? ""}</p>
                      </div>
                      <div className="my-1 h-px bg-biz-border" />
                      <Link
                        href="/business/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-biz-ink transition-colors hover:bg-biz-bg"
                      >
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* "More" drawer — slides up from the bottom on mobile (opened by the More tab) */}
          {menuOpen && (
            <div
              className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            >
              <div
                className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-biz-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-[slideUp_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-biz-border" />
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-biz-ink">All sections</p>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-biz-bg text-biz-ink"
                    aria-label="Close"
                    onClick={() => setMenuOpen(false)}
                  >
                    <CloseSvg />
                  </button>
                </div>
                <nav className="grid grid-cols-2 gap-2">
                  {moreNavItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 transition-colors",
                          active
                            ? "border-biz-violet-200 bg-biz-violet-50 text-biz-violet-700"
                            : "border-biz-border bg-biz-bg text-biz-ink active:bg-biz-border"
                        )}
                      >
                        <NavIcon name={item.label as IconName} className="h-5 w-5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight">{item.label}</p>
                          <p className="truncate text-[11px] text-biz-muted-2">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 w-full rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors active:bg-red-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          <main key={pathname} className="page-enter mt-4 flex-1 pb-24 lg:pb-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t border-biz-border bg-biz-surface/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        {bottomNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-all active:scale-95",
                active ? "text-biz-violet-600" : "text-biz-muted-2 active:text-biz-ink"
              )}
            >
              <span className="relative flex h-8 w-12 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="biz-tab-pill"
                    className="absolute inset-0 rounded-full bg-biz-violet-50"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <NavIcon name={item.icon as IconName} className="relative h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
        {/* More — opens the drawer */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-all active:scale-95",
            menuOpen ? "text-biz-violet-600" : "text-biz-muted-2 active:text-biz-ink"
          )}
          aria-label="More sections"
          aria-expanded={menuOpen}
        >
          <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", menuOpen && "bg-biz-violet-50")}>
            <MoreSvg />
          </span>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </div>
  );
}

// Bottom tab bar: the 4 highest-frequency destinations. The rest live in the "More" drawer.
const bottomNavItems = [
  { href: "/business/dashboard", label: "Home", icon: "Dashboard" },
  { href: "/business/calendar", label: "Calendar", icon: "Calendar" },
  { href: "/business/clients", label: "Clients", icon: "Clients" },
  { href: "/business/pos", label: "POS", icon: "POS" },
] as const;

// "More" drawer: everything not in the bottom bar.
const bottomHrefs = new Set<string>(bottomNavItems.map((i) => i.href));
const moreNavItems = businessNavigation.filter((i) => !bottomHrefs.has(i.href));

function MoreSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
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

// ─── Global Search ────────────────────────────────────────────────────────────

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(q), 280);
  }, [q]);

  const enabled = debounced.trim().length >= 2;

  const { data: clientsData } = useQuery({
    queryKey: ["search-clients", debounced],
    queryFn: () => clientsApi.list({ q: debounced, limit: 5 }),
    enabled,
  });

  const { data: aptsData } = useQuery({
    queryKey: ["search-apts", debounced],
    queryFn: () => appointmentsApi.list(),
    enabled,
  });

  const clients = clientsData?.clients ?? [];
  const apts = (aptsData?.appointments ?? []).filter((a) =>
    a.client.fullName.toLowerCase().includes(debounced.toLowerCase()) ||
    a.items.some((i) => i.service.name.toLowerCase().includes(debounced.toLowerCase()))
  ).slice(0, 4);

  const hasResults = clients.length > 0 || apts.length > 0;

  function navigate(href: string) { router.push(href); onClose(); }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-biz-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-biz-border px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-biz-muted-2" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients, bookings, services…"
            className="flex-1 bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
          />
          <kbd className="rounded-md bg-biz-bg px-1.5 py-0.5 text-[10px] font-semibold text-biz-muted-2">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!enabled && (
            <div className="px-3 py-8 text-center text-xs text-biz-muted-2">Type at least 2 characters to search…</div>
          )}

          {enabled && !hasResults && (
            <div className="px-3 py-8 text-center text-xs text-biz-muted-2">No results for &ldquo;{debounced}&rdquo;</div>
          )}

          {clients.length > 0 && (
            <div>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Clients</p>
              {clients.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => navigate("/business/clients")}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-biz-bg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biz-violet-50 text-xs font-bold text-biz-violet-700">
                    {c.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-biz-ink">{c.fullName}</p>
                    <p className="text-xs text-biz-muted-2">{c.phone ?? c.email ?? `${c.totalVisits} visits`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {apts.length > 0 && (
            <div>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Appointments</p>
              {apts.map((a) => (
                <button key={a.id} type="button"
                  onClick={() => navigate("/business/calendar")}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-biz-bg">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biz-orange-300/25 text-xs font-bold text-biz-orange-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-biz-ink">{a.client.fullName}</p>
                    <p className="text-xs text-biz-muted-2">
                      {a.items[0]?.service.name ?? "—"} · {new Date(a.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick nav */}
          <div className="border-t border-biz-border mt-2 pt-2">
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Quick nav</p>
            {[
              { label: "Dashboard", href: "/business/dashboard" },
              { label: "Calendar", href: "/business/calendar" },
              { label: "Clients", href: "/business/clients" },
              { label: "POS", href: "/business/pos" },
            ].map((item) => (
              <button key={item.href} type="button" onClick={() => navigate(item.href)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-biz-muted hover:bg-biz-bg hover:text-biz-ink">
                → {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
