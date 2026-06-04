"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminLead } from "@/lib/admin-api";

// Pipeline stages in order
const PIPELINE: { status: string; label: string; color: string }[] = [
  { status: "new",            label: "New",            color: "bg-blue-950 text-blue-300 border-blue-900" },
  { status: "contacted",      label: "Contacted",      color: "bg-amber-950 text-amber-300 border-amber-900" },
  { status: "demo_scheduled", label: "Demo Scheduled", color: "bg-violet-950 text-violet-300 border-violet-900" },
  { status: "demo_done",      label: "Demo Done",      color: "bg-orange-950 text-orange-300 border-orange-900" },
  { status: "converted",      label: "Onboarded",      color: "bg-emerald-950 text-emerald-300 border-emerald-900" },
  { status: "rejected",       label: "Rejected",       color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
];

const NEXT_ACTIONS: Record<string, { label: string; next: string; cta: string }> = {
  new:            { label: "First contact SOP", next: "contacted",      cta: "Mark as Contacted" },
  contacted:      { label: "Demo scheduling SOP", next: "demo_scheduled", cta: "Mark Demo Scheduled" },
  demo_scheduled: { label: "Demo checklist",     next: "demo_done",      cta: "Mark Demo Done" },
  demo_done:      { label: "Closing SOP",        next: "converted",      cta: "Onboard Client →" },
};

const SOP_CONTENT: Record<string, { steps: string[]; template: string }> = {
  new: {
    steps: [
      "Call within 2 hours of signup (golden window)",
      "Introduce yourself as Clitell team",
      "Understand their current booking/management process",
      "Note down: current tool, team size, biggest pain point",
      "Qualify: do they own the business? Are they decision maker?",
      "If qualified → schedule demo. If not → mark Rejected with note.",
    ],
    template: `Hi [Name]! 👋 I'm [Your Name] from Clitell. I saw you signed up and wanted to reach out personally.

We help salons & spas manage appointments, staff, and clients — all in one place.

Quick question: what are you currently using to manage bookings?

Would you have 20 mins this week for a quick demo? I'll show you exactly how it works for a [businessType] like yours.`,
  },
  contacted: {
    steps: [
      "Send calendar invite with Zoom/Google Meet link",
      "Share a 1-pager PDF about Clitell before the call",
      "Confirm the demo 1 day before via WhatsApp",
      "Prepare demo account with sample data for their business type",
      "Know their city — mention local salons using Clitell if possible",
    ],
    template: `Hi [Name]! Confirming our demo tomorrow at [time].

Here's the meeting link: [LINK]

I've set up a sample account for a [businessType] so you can see exactly how it'll look for your business. See you then! 🙌`,
  },
  demo_scheduled: {
    steps: [
      "Start with their pain: 'You mentioned X was a problem — let me show you how we solve that first'",
      "Show: Dashboard → Appointments → Client history → WhatsApp reminders",
      "Show: Staff management, Reports",
      "Show mobile app — this is usually the wow moment",
      "Ask: 'Does this solve what you were looking for?'",
      "Talk pricing only AFTER they've seen value",
      "End with: 'I can get you set up today — want to pick a plan?'",
    ],
    template: `Thanks for your time today [Name]! Great chatting.

As discussed, here's what's included in your plan:
✅ Unlimited appointments
✅ Client management
✅ WhatsApp reminders
✅ Staff & reports

To get started: [LOGIN_URL]

Let me know if you have any questions — I'm just a WhatsApp away! 📱`,
  },
  demo_done: {
    steps: [
      "Send follow-up within 1 hour of demo",
      "Include pricing comparison table (your plan vs competitors)",
      "Offer: 'I can set up your account with your services & staff right now'",
      "If hesitant: offer 14-day free trial, no card needed",
      "If they say yes → go to Businesses tab → Create Business → share credentials",
      "Follow up in 48 hours if no response",
      "After 5 days no response → mark Rejected, note reason",
    ],
    template: `Hi [Name]! Following up on our demo.

I've reserved a [plan] account for you. To activate it, just reply 'Yes' and I'll send your login details within minutes.

Or if you'd like to start with our free 14-day trial — no commitment — I can set that up too.

What works best for you? 😊`,
  },
};

const KINDS = [
  { v: "", label: "All" },
  { v: "signup", label: "Signups" },
  { v: "demo", label: "Demo requests" },
  { v: "contact", label: "Contact" },
];

function exportCSV(leads: AdminLead[]) {
  const cols = ["Name", "Email", "Phone", "Business", "Type", "City", "Kind", "Status", "Message", "Date"];
  const rows = leads.map((l) => [
    l.fullName, l.email ?? "", l.phone ?? "", l.businessName ?? "",
    l.businessType ?? "", l.city ?? "", l.kind, l.status,
    (l.message ?? "").replace(/"/g, '""'),
    new Date(l.createdAt).toLocaleDateString("en-IN"),
  ].map((v) => `"${v}"`).join(","));
  const csv = [cols.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clitell-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminLeadsPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-leads", kind],
    queryFn: () => adminApi.leads({ kind: kind || undefined }),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.setLead(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
    onError: (e) => alert((e as Error).message),
  });

  const leads = data?.leads ?? [];
  const counts = data?.counts ?? {};

  const filtered = stageFilter ? leads.filter((l) => l.status === stageFilter) : leads;

  const totalActive = leads.filter(
    (l) => !["converted", "rejected"].includes(l.status)
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Waitlist & Pipeline</h1>
          <p className="text-sm text-zinc-400">
            {totalActive} active · {counts.converted ?? 0} onboarded · {counts.new ?? 0} new
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={() => exportCSV(filtered.length < leads.length ? filtered : leads)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            ↓ Export CSV
          </button>
        )}
      </div>

      {/* Pipeline stage bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStageFilter("")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
            stageFilter === ""
              ? "bg-zinc-200 text-zinc-900 border-zinc-200"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          All ({leads.length})
        </button>
        {PIPELINE.map((s) => (
          <button
            key={s.status}
            onClick={() => setStageFilter(stageFilter === s.status ? "" : s.status)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              stageFilter === s.status ? s.color : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {s.label} ({counts[s.status] ?? 0})
          </button>
        ))}
      </div>

      {/* Kind filter */}
      <div className="flex gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.v}
            onClick={() => setKind(k.v)}
            className={kind === k.v
              ? "rounded-lg bg-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-100"
              : "rounded-lg border border-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-900"}
          >
            {k.label}
          </button>
        ))}
      </div>

      {isError && (
        <p className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {(error as Error)?.message ?? "Failed to load leads"}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : filtered.length === 0 && !isError ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
          No leads{stageFilter ? ` in "${stageFilter}"` : ""}{kind ? ` for ${kind}` : ""}.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((l) => (
            <LeadRow
              key={l.id}
              l={l}
              busy={update.isPending}
              expanded={expanded === l.id}
              onToggle={() => setExpanded(expanded === l.id ? null : l.id)}
              onStatus={(status) => update.mutate({ id: l.id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadRow({
  l, onStatus, busy, expanded, onToggle,
}: {
  l: AdminLead;
  onStatus: (s: string) => void;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const stage = PIPELINE.find((s) => s.status === l.status);
  const nextAction = NEXT_ACTIONS[l.status];
  const sop = SOP_CONTENT[l.status];
  const [copied, setCopied] = useState(false);

  function copyTemplate() {
    if (!sop) return;
    const text = sop.template
      .replace("[Name]", l.fullName)
      .replace("[businessType]", l.businessType ?? "business");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`rounded-2xl border bg-zinc-900/40 transition ${expanded ? "border-zinc-600" : "border-zinc-800"}`}>
      {/* Main row */}
      <div
        className="flex cursor-pointer flex-wrap items-start justify-between gap-3 p-4"
        onClick={onToggle}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{l.fullName}</p>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {l.kind}
            </span>
            {stage && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stage.color}`}>
                {stage.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {[l.email, l.phone, l.businessName, l.businessType, l.city].filter(Boolean).join(" · ") || "—"}
          </p>
          {l.message && (
            <p className="mt-1 line-clamp-1 text-xs text-zinc-500">"{l.message}"</p>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <p className="text-[11px] text-zinc-600">
            {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
          <select
            value={l.status}
            disabled={busy}
            onChange={(e) => onStatus(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs capitalize text-zinc-200 focus:outline-none"
          >
            {PIPELINE.map((s) => (
              <option key={s.status} value={s.status}>{s.label}</option>
            ))}
          </select>
          <span className="text-zinc-600">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded SOP panel */}
      {expanded && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-4">
          {/* Lead details */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
            {l.email && <Detail label="Email" value={l.email} />}
            {l.phone && <Detail label="Phone" value={l.phone} />}
            {l.businessName && <Detail label="Business" value={l.businessName} />}
            {l.city && <Detail label="City" value={l.city} />}
          </div>

          {/* SOP checklist */}
          {sop && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {nextAction?.label ?? "SOP"} — checklist
              </p>
              <ol className="space-y-1.5">
                {sop.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-300">
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] text-zinc-600">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Message template */}
              <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  Message template (pre-filled)
                </p>
                <p className="whitespace-pre-wrap text-xs text-zinc-400 leading-relaxed">
                  {sop.template.replace("[Name]", l.fullName).replace("[businessType]", l.businessType ?? "business")}
                </p>
                <button
                  onClick={copyTemplate}
                  className="mt-2 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-600"
                >
                  {copied ? "✓ Copied!" : "Copy message"}
                </button>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          {nextAction && (
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={() => onStatus(nextAction.next)}
                className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-40"
              >
                {nextAction.cta}
              </button>
              {l.status !== "rejected" && (
                <button
                  disabled={busy}
                  onClick={() => onStatus("rejected")}
                  className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-900/40 disabled:opacity-40"
                >
                  Reject
                </button>
              )}
              {l.status === "demo_done" && (
                <a
                  href="/admin/tenants"
                  className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/40"
                >
                  Go to Businesses → Create Account
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-600">{label}</p>
      <p className="text-zinc-300 truncate">{value}</p>
    </div>
  );
}
