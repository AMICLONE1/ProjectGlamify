"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/session";
import { ClitellMark } from "@/components/layout/Logo";

const nav = [
  { href: "/admin", label: "Overview", icon: GridIcon },
  { href: "/admin/tenants", label: "Businesses", icon: BuildingIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/leads", label: "Pipeline", icon: InboxIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-screen-2xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50 p-4 md:flex">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <ClitellMark className="h-6 w-auto" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">Clitell</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Platform Admin</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleSignOut}
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-red-400"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <ClitellMark className="h-5 w-auto" />
            </span>
            <p className="text-sm font-bold">Admin</p>
            <button onClick={handleSignOut} className="ml-auto text-xs text-zinc-400 hover:text-red-400">Sign out</button>
          </header>

          <main className="flex-1 p-4 pb-24 sm:p-6 md:pb-6">{children}</main>

          {/* Mobile bottom nav */}
          <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-stretch justify-around border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
            {nav.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                    active ? "text-white" : "text-zinc-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────
type IP = { className?: string };
function GridIcon({ className }: IP) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function BuildingIcon({ className }: IP) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M9 7h2M9 11h2M9 15h2M17 21V11h2a2 2 0 012 2v8"/></svg>; }
function UsersIcon({ className }: IP) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function InboxIcon({ className }: IP) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>; }
function LogoutIcon({ className }: IP) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>; }
