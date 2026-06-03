"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminTenant } from "@/lib/admin-api";

export default function AdminTenantsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-tenants", q], queryFn: () => adminApi.tenants(q) });

  const mutate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { suspended?: boolean; plan?: string } }) => adminApi.setTenant(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenants"] }),
  });

  const tenants = data?.tenants ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Businesses</h1>
          <p className="text-sm text-zinc-400">{tenants.length} {tenants.length === 1 ? "business" : "businesses"}</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, slug, email…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none sm:w-72"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : tenants.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">No businesses found.</p>
      ) : (
        <div className="space-y-2.5">
          {tenants.map((t) => (
            <TenantRow key={t.id} t={t} busy={mutate.isPending} onChange={(body) => mutate.mutate({ id: t.id, body })} />
          ))}
        </div>
      )}
    </div>
  );
}

const PLANS = ["trial", "starter", "growth", "professional", "enterprise"];

function TenantRow({ t, onChange, busy }: { t: AdminTenant; onChange: (b: { suspended?: boolean; plan?: string }) => void; busy: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{t.name}</p>
            {t.suspended && <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-semibold text-red-300">Suspended</span>}
          </div>
          <p className="text-xs text-zinc-500">/{t.slug} · {t.businessType} · {t.email ?? "no email"}</p>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {t.counts.users} users · {t.counts.clients} clients · {t.counts.locations} locations · joined {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={t.plan}
            disabled={busy}
            onChange={(e) => onChange({ plan: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs capitalize text-zinc-200 focus:outline-none"
          >
            {PLANS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <button
            disabled={busy}
            onClick={() => onChange({ suspended: !t.suspended })}
            className={t.suspended
              ? "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              : "rounded-lg border border-red-900 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 disabled:opacity-50"}
          >
            {t.suspended ? "Activate" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}
