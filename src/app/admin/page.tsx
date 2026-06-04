"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Skeleton } from "@/components/ui/Skeleton";

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function AdminOverviewPage() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, dataUpdatedAt } = useQuery({ queryKey: ["admin-metrics"], queryFn: () => adminApi.metrics() });

  async function refresh() {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["admin-metrics"] });
    setRefreshing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Platform overview</h1>
          <p className="text-sm text-zinc-400">
            All businesses · {dataUpdatedAt ? `updated ${new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "loading…"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading || refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
        >
          <RefreshIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-950/50 p-4 text-sm text-red-300">{(error as Error).message}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Businesses" value={data?.tenants.total} loading={isLoading}
          sub={data ? `+${data.tenants.thisMonth} this month` : undefined}
          trend={data?.tenants.growthPct} />
        <Stat label="Total GMV" value={data ? inr(data.gmv.total) : undefined} loading={isLoading}
          sub={data ? `${inr(data.gmv.thisMonth)} this month` : undefined} />
        <Stat label="Bookings" value={data?.bookings.total} loading={isLoading}
          sub={data ? `${data.bookings.last30} in 30d` : undefined} />
        <Stat label="Active users" value={data?.users.active} loading={isLoading}
          sub={data ? `of ${data.users.total} total` : undefined} />
        <Stat label="Clients (all)" value={data?.clients.total} loading={isLoading} />
        <Stat label="Pending waitlist" value={data?.leads.pending} loading={isLoading}
          href="/admin/leads" />
      </div>

      {/* Plan distribution */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-zinc-300">Plan distribution</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {isLoading && <span className="text-sm text-zinc-500">Loading…</span>}
          {data?.plans.map((p) => (
            <span key={p.plan} className="rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs">
              <span className="font-semibold capitalize text-zinc-200">{p.plan}</span>
              <span className="ml-1.5 text-zinc-400">{p.count}</span>
            </span>
          ))}
          {data && data.plans.length === 0 && <span className="text-sm text-zinc-500">No businesses yet.</span>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink href="/admin/tenants" title="Businesses" desc="Manage all salons & spas" />
        <QuickLink href="/admin/users" title="Users" desc="Access & roles across tenants" />
        <QuickLink href="/admin/leads" title="Waitlist" desc="Signups & demo requests" />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, trend, loading, href }: {
  label: string; value?: string | number; sub?: string; trend?: number; loading?: boolean; href?: string;
}) {
  const body = (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight">
        {loading ? <Skeleton dark className="inline-block h-7 w-16 rounded align-middle" /> : value ?? "—"}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
        {typeof trend === "number" && trend !== 0 && (
          <span className={trend > 0 ? "text-[11px] font-semibold text-emerald-400" : "text-[11px] font-semibold text-red-400"}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-600">
      <p className="text-sm font-semibold">{title} →</p>
      <p className="mt-0.5 text-xs text-zinc-400">{desc}</p>
    </Link>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
