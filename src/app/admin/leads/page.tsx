"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminLead } from "@/lib/admin-api";

const STATUSES = ["new", "contacted", "converted", "rejected"];
const KINDS = [
  { v: "", label: "All" },
  { v: "signup", label: "Signups" },
  { v: "demo", label: "Demos" },
  { v: "contact", label: "Contact" },
];

export default function AdminLeadsPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-leads", kind], queryFn: () => adminApi.leads({ kind: kind || undefined }) });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.setLead(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  const leads = data?.leads ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Waitlist & requests</h1>
          <p className="text-sm text-zinc-400">{leads.length} {kind || "total"} · {data?.counts.new ?? 0} new</p>
        </div>
        <div className="flex gap-1.5">
          {KINDS.map((k) => (
            <button key={k.v} onClick={() => setKind(k.v)}
              className={kind === k.v
                ? "rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-900"
                : "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"}>
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">No submissions{kind ? ` for ${kind}` : ""} yet.</p>
      ) : (
        <div className="space-y-2.5">
          {leads.map((l) => (
            <LeadRow key={l.id} l={l} busy={update.isPending} onStatus={(status) => update.mutate({ id: l.id, status })} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadRow({ l, onStatus, busy }: { l: AdminLead; onStatus: (s: string) => void; busy: boolean }) {
  const badge: Record<string, string> = {
    new: "bg-blue-950 text-blue-300",
    contacted: "bg-amber-950 text-amber-300",
    converted: "bg-emerald-950 text-emerald-300",
    rejected: "bg-zinc-800 text-zinc-400",
  };
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{l.fullName}</p>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{l.kind}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${badge[l.status] ?? "bg-zinc-800 text-zinc-400"}`}>{l.status}</span>
          </div>
          <p className="text-xs text-zinc-500">
            {[l.email, l.phone, l.businessName, l.city].filter(Boolean).join(" · ") || "—"}
          </p>
          {l.message && <p className="mt-1.5 line-clamp-2 text-xs text-zinc-400">“{l.message}”</p>}
          <p className="mt-1 text-[11px] text-zinc-600">
            {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <select
          value={l.status}
          disabled={busy}
          onChange={(e) => onStatus(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs capitalize text-zinc-200 focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
    </div>
  );
}
