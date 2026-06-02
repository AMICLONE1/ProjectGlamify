"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { clientsApi, type ClientSummary } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";

type TagFilter = "all" | "vip" | "new" | "at-risk" | "regular";
const TAG_FILTERS: { id: TagFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vip", label: "VIP" },
  { id: "regular", label: "Regular" },
  { id: "new", label: "New" },
  { id: "at-risk", label: "At-risk" },
];

const tagBadge: Record<string, string> = {
  vip: "bg-biz-orange-300/25 text-biz-orange-600",
  regular: "bg-biz-violet-50 text-biz-violet-700",
  new: "bg-biz-green-400/15 text-biz-green-500",
  "at-risk": "bg-biz-pink-200/40 text-biz-pink-500",
};

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function relativeDate(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function ClientsBoard() {
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(search), 300);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["clients", debouncedQ, tagFilter],
    queryFn: () =>
      clientsApi.list({
        q: debouncedQ || undefined,
        tag: tagFilter !== "all" ? tagFilter : undefined,
        limit: 50,
      }),
  });

  const clients = data?.clients ?? [];
  const total = data?.meta.total ?? 0;
  const selected = clients.find((c) => c.id === selectedId) ?? null;

  // Auto-select first client when data arrives
  useEffect(() => {
    if (!selectedId && clients.length > 0) setSelectedId(clients[0].id);
  }, [clients, selectedId]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Clients</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {isLoading ? "…" : `${total} active clients`}
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Search by name, phone, or email · filter by tag · open the side panel for full profile.
          </p>
        </div>
        <button className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600">
          Add client
        </button>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-56 items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
              <SearchIcon className="h-4 w-4 text-biz-muted-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients by name, phone, or email…"
                className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="text-xs text-biz-muted-2 hover:text-biz-ink">
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
              {TAG_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTagFilter(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    tagFilter === f.id ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                  <th className="px-3 py-3 font-semibold">Client</th>
                  <th className="px-3 py-3 font-semibold">Tags</th>
                  <th className="px-3 py-3 font-semibold">Visits</th>
                  <th className="px-3 py-3 font-semibold">Spend</th>
                  <th className="px-3 py-3 font-semibold">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-biz-border">
                      <td colSpan={5} className="px-3 py-3">
                        <div className="h-8 animate-pulse rounded-xl bg-biz-bg" />
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && clients.map((c) => {
                  const active = c.id === selectedId;
                  const primaryTag = c.tags[0];
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "cursor-pointer border-b border-biz-border transition-colors",
                        active ? "bg-biz-violet-50/60" : "hover:bg-biz-bg"
                      )}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-biz-violet-400 to-biz-magenta-500 text-xs font-bold text-white">
                            {initials(c.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-biz-ink">{c.fullName}</p>
                            <p className="truncate text-xs text-biz-muted-2">{c.phone ?? c.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {primaryTag && (
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", tagBadge[primaryTag] ?? "bg-biz-bg text-biz-muted")}>
                            {primaryTag}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-semibold text-biz-ink">{c.totalVisits}</td>
                      <td className="px-3 py-3 font-semibold text-biz-ink">{formatINR(c.totalSpend)}</td>
                      <td className="px-3 py-3 text-biz-muted">{relativeDate(c.lastVisitAt)}</td>
                    </tr>
                  );
                })}
                {!isLoading && clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-sm text-biz-muted-2">
                      No clients match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-3xl bg-biz-surface p-6 shadow-sm">
          {selected ? <ClientPanel client={selected} /> : <p className="text-sm text-biz-muted">Pick a client to view profile.</p>}
        </aside>
      </div>
    </div>
  );
}

function ClientPanel({ client }: { client: ClientSummary }) {
  const tagBg = client.tags[0] ? (tagBadge[client.tags[0]] ?? "bg-biz-bg text-biz-muted") : "bg-biz-bg text-biz-muted";
  const avg = client.totalVisits > 0 ? Math.round(client.totalSpend / client.totalVisits) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-biz-violet-400 to-biz-magenta-500 text-lg font-bold text-white">
          {initials(client.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-bold text-biz-ink">{client.fullName}</h2>
          <p className="text-xs text-biz-muted-2">{client.phone ?? "—"}</p>
          <p className="text-xs text-biz-muted-2">{client.email ?? "—"}</p>
        </div>
      </div>

      {client.tags.length > 0 && (
        <div className={cn("rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-wider", tagBg)}>
          {client.tags.join(" · ")} · {client.loyaltyPoints} pts
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Visits" value={String(client.totalVisits)} />
        <Stat label="Spend" value={"₹" + client.totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })} />
        <Stat label="Avg" value={"₹" + avg.toLocaleString("en-IN", { maximumFractionDigits: 0 })} />
      </div>

      <div className="rounded-2xl bg-biz-bg p-4">
        <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">Last visit</p>
        <p className="mt-1 text-sm text-biz-ink">{relativeDate(client.lastVisitAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-full bg-biz-violet-500 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-biz-violet-600">
          Book again
        </button>
        <button className="rounded-full bg-biz-bg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border">
          Send offer
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-biz-bg p-3 text-center">
      <p className="text-[9px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <p className="mt-1 font-display text-sm font-bold text-biz-ink">{value}</p>
    </div>
  );
}
