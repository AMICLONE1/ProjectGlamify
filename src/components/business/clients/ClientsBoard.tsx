"use client";

import { useMemo, useState } from "react";
import { clients, formatINR, type Client } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";

const segments: { id: "all" | Client["segment"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "VIP", label: "VIP" },
  { id: "Regular", label: "Regular" },
  { id: "New", label: "New" },
  { id: "At-risk", label: "At-risk" },
];

const segmentBadge: Record<Client["segment"], string> = {
  VIP: "bg-biz-orange-300/25 text-biz-orange-600",
  Regular: "bg-biz-violet-50 text-biz-violet-700",
  New: "bg-biz-green-400/15 text-biz-green-500",
  "At-risk": "bg-biz-pink-200/40 text-biz-pink-500",
};

export function ClientsBoard() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<(typeof segments)[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(clients[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (segment !== "all" && c.segment !== segment) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [search, segment]);

  const selected = clients.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Clients</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {clients.length} active clients
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Search by name, phone, or email · filter by segment · open the side panel for full profile.
          </p>
        </div>
        <button className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600">
          Add client
        </button>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-[14rem] items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
              <SearchIcon className="h-4 w-4 text-biz-muted-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients by name, phone, or email…"
                className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs text-biz-muted-2 hover:text-biz-ink"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
              {segments.map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setSegment(seg.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    segment === seg.id
                      ? "bg-biz-surface text-biz-ink shadow-sm"
                      : "text-biz-muted hover:text-biz-ink"
                  )}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                  <th className="px-3 py-3 font-semibold">Client</th>
                  <th className="px-3 py-3 font-semibold">Segment</th>
                  <th className="px-3 py-3 font-semibold">Visits</th>
                  <th className="px-3 py-3 font-semibold">Spend</th>
                  <th className="px-3 py-3 font-semibold">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const active = c.id === selectedId;
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
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-biz-violet-400 to-biz-magenta-500 text-xs font-bold text-white">
                            {c.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-biz-ink">{c.name}</p>
                            <p className="truncate text-xs text-biz-muted-2">{c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            segmentBadge[c.segment]
                          )}
                        >
                          {c.segment}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-biz-ink">{c.totalVisits}</td>
                      <td className="px-3 py-3 font-semibold text-biz-ink">{formatINR(c.totalSpend)}</td>
                      <td className="px-3 py-3 text-biz-muted">{c.lastVisit}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
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
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-biz-violet-400 to-biz-magenta-500 text-lg font-bold text-white">
                  {selected.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-xl font-bold text-biz-ink">{selected.name}</h2>
                  <p className="text-xs text-biz-muted-2">Preferred · {selected.preferredStylist}</p>
                  <p className="text-xs text-biz-muted-2">{selected.phone}</p>
                </div>
              </div>

              <div
                className={cn(
                  "rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                  segmentBadge[selected.segment]
                )}
              >
                {selected.segment} · {selected.loyaltyPoints} loyalty points
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="Visits" value={String(selected.totalVisits)} />
                <Stat label="Spend" value={formatINR(selected.totalSpend)} />
                <Stat label="Avg" value={formatINR(selected.avgTicket)} />
              </div>

              {selected.allergies.length > 0 && (
                <div className="rounded-2xl bg-biz-pink-200/30 p-3 text-xs text-biz-pink-500">
                  <p className="font-semibold uppercase tracking-wider">Allergies</p>
                  <p className="mt-1">{selected.allergies.join(" · ")}</p>
                </div>
              )}

              <div className="rounded-2xl bg-biz-bg p-4">
                <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">Notes</p>
                <p className="mt-2 text-sm leading-relaxed text-biz-ink">{selected.notes}</p>
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
          ) : (
            <p className="text-sm text-biz-muted">Pick a client to view profile.</p>
          )}
        </aside>
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
