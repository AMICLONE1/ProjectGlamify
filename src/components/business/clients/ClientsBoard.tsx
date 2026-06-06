"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { clientsApi, type ClientSummary } from "@/lib/api-client";
import { ImportClientsModal } from "./ImportClientsModal";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import type { ClientDetail } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/Skeleton";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tagFilter, setTagFilter] = useState<TagFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="rounded-full border border-biz-border bg-biz-surface px-4 py-2 text-xs font-semibold text-biz-ink hover:border-biz-violet-300 hover:text-biz-violet-600"
          >
            ↑ Import from Excel
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
          >
            + Add client
          </button>
        </div>
      </header>

      {showImport && (
        <ImportClientsModal
          onClose={() => setShowImport(false)}
          onDone={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
        />
      )}

      {showAdd && (
        <AddClientModal
          onClose={() => setShowAdd(false)}
          onCreated={(id) => {
            setShowAdd(false);
            setSelectedId(id);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
          }}
        />
      )}

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
            <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-biz-bg p-1 scrollbar-hide">
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

          {/* Mobile: card list (tables are unusable on small screens) */}
          <div className="mt-5 space-y-2 md:hidden">
            {isLoading && [...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            {!isLoading && clients.map((c) => {
              const active = c.id === selectedId;
              const primaryTag = c.tags[0];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    active ? "border-biz-violet-300 bg-biz-violet-50/60" : "border-biz-border bg-biz-bg hover:bg-biz-surface"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-biz-violet-400 to-biz-magenta-500 text-xs font-bold text-white">
                    {initials(c.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-biz-ink">{c.fullName}</p>
                    <p className="truncate text-xs text-biz-muted-2">{c.phone ?? c.email ?? "—"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {primaryTag && (
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tagBadge[primaryTag] ?? "bg-biz-surface text-biz-muted")}>
                        {primaryTag}
                      </span>
                    )}
                    <p className="mt-1 text-[11px] text-biz-muted">{c.totalVisits} visits · {formatINR(c.totalSpend)}</p>
                  </div>
                </button>
              );
            })}
            {!isLoading && clients.length === 0 && (
              <p className="rounded-2xl border border-biz-border bg-biz-bg p-8 text-center text-sm text-biz-muted-2">No clients match the current filters.</p>
            )}
          </div>

          {/* Desktop: full table */}
          <div className="mt-5 hidden overflow-x-auto md:block">
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
                        <Skeleton className="h-8 rounded-xl" />
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
          {selected ? <ClientPanel client={selected} /> : (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-biz-bg text-biz-muted-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </span>
              <p className="text-sm font-medium text-biz-muted">Select a client</p>
              <p className="text-xs text-biz-muted-2">Click any row to view their profile, history, and quick actions.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

type ClientPanelTab = "profile" | "history";

function ClientPanel({ client }: { client: ClientSummary }) {
  const queryClient = useQueryClient();
  const tagBg = client.tags[0] ? (tagBadge[client.tags[0]] ?? "bg-biz-bg text-biz-muted") : "bg-biz-bg text-biz-muted";
  const avg = client.totalVisits > 0 ? Math.round(client.totalSpend / client.totalVisits) : 0;
  const [showBook, setShowBook] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [tab, setTab] = useState<ClientPanelTab>("profile");

  const { data: detail, isLoading: detailLoading } = useQuery<ClientDetail>({
    queryKey: ["client-detail", client.id],
    queryFn: () => clientsApi.getDetail(client.id),
    enabled: tab === "history",
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-biz-violet-400 to-biz-magenta-500 text-lg font-bold text-white">
          {initials(client.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-bold text-biz-ink">{client.fullName}</h2>
          <p className="text-xs text-biz-muted-2">{client.phone ?? "—"}</p>
          <p className="text-xs text-biz-muted-2">{client.email ?? "—"}</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-full bg-biz-bg p-1">
        {(["profile", "history"] as ClientPanelTab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn("flex-1 rounded-full py-1.5 text-xs font-semibold capitalize transition-colors",
              tab === t ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <>
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
            <button type="button" onClick={() => setShowBook(true)}
              className="rounded-full bg-biz-violet-500 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-biz-violet-600">
              Book again
            </button>
            <button type="button" onClick={() => setShowOffer(true)}
              className="rounded-full bg-biz-bg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border">
              Send offer
            </button>
          </div>
        </>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {detailLoading && (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-biz-violet-500 border-t-transparent" />
            </div>
          )}
          {detail && detail.appointments.length === 0 && (
            <p className="py-8 text-center text-sm text-biz-muted">No visits recorded yet.</p>
          )}
          {detail?.appointments.map((apt) => {
            const svcNames = apt.items.map((i) => i.service.name).join(", ") || "—";
            const statusStyle: Record<string, string> = {
              confirmed: "text-biz-violet-600", in_progress: "text-biz-green-500",
              completed: "text-biz-muted", cancelled: "text-biz-muted line-through", no_show: "text-biz-pink-500",
            };
            return (
              <div key={apt.id} className="rounded-2xl bg-biz-bg px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-biz-ink">
                    {new Date(apt.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", statusStyle[apt.status] ?? "text-biz-muted")}>
                    {apt.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-biz-muted-2 truncate">{svcNames}</p>
              </div>
            );
          })}
          {detail && detail.loyaltyTxns.length > 0 && (
            <>
              <p className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Loyalty</p>
              {detail.loyaltyTxns.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-2xl bg-biz-bg px-4 py-2.5 text-xs">
                  <span className="text-biz-muted">{txn.note ?? txn.type}</span>
                  <span className={cn("font-bold", txn.type === "earn" ? "text-biz-green-500" : "text-biz-pink-500")}>
                    {txn.type === "earn" ? "+" : "-"}{txn.points} pts
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {showBook && (
        <QuickBookModal client={client} onClose={() => setShowBook(false)}
          onBooked={() => { setShowBook(false); queryClient.invalidateQueries({ queryKey: ["calendar"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }} />
      )}
      {showOffer && <SendOfferSheet client={client} onClose={() => setShowOffer(false)} />}
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

// ─── Add Client Modal ─────────────────────────────────────────────────────────

const GENDER_OPTIONS = ["", "female", "male", "other", "prefer_not_to_say"];
const TAG_OPTIONS = ["vip", "regular", "new", "at-risk", "birthday"];

function AddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", dob: "", gender: "", notes: "", tags: [] as string[] });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => clientsApi.create({ ...form, gender: form.gender || undefined, email: form.email || undefined, dob: form.dob || undefined, notes: form.notes || undefined }),
    onSuccess: (client: ClientSummary) => onCreated(client.id),
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to create client"),
  });

  function set(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleTag(t: string) {
    setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-biz-ink">New client</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink" aria-label="Close">✕</button>
        </div>

        <div className="space-y-3">
          <Field label="Full name *">
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Priya Sharma" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765…" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="priya@email.com" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of birth">
              <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g ? g.replace("_", " ") : "—"}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Allergies, preferences…" className={inputCls} />
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap gap-2 pt-1">
              {TAG_OPTIONS.map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className={cn("rounded-full px-3 py-1 text-[11px] font-semibold transition-colors", form.tags.includes(t) ? "bg-biz-violet-500 text-white" : "bg-biz-bg text-biz-muted hover:text-biz-ink")}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted hover:bg-biz-border">
            Cancel
          </button>
          <button
            type="button"
            disabled={!form.fullName.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 rounded-2xl bg-biz-violet-500 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : "Save client"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">{label}</label>
      {children}
    </div>
  );
}

// ─── Quick Book Modal ─────────────────────────────────────────────────────────

import { appointmentsApi, servicesApi, locationsApi } from "@/lib/api-client";
import { getUser } from "@/lib/session";

function QuickBookModal({ client, onClose, onBooked }: { client: ClientSummary; onClose: () => void; onBooked: () => void }) {
  const user = getUser();
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });
  const services = servicesData?.services ?? [];

  const mutation = useMutation({
    mutationFn: () => {
      const locationId = user?.locationId;
      if (!locationId) throw new Error("No location configured for your account.");
      if (!serviceId) throw new Error("Select a service.");
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      return appointmentsApi.create({ locationId, clientId: client.id, startsAt, serviceIds: [serviceId] });
    },
    onSuccess: onBooked,
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to create booking"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-biz-ink">Book — {client.fullName}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>
        <div className="space-y-3">
          <Field label="Service *">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
              <option value="">Select service…</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.durationMinutes}min</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Time *">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted hover:bg-biz-border">Cancel</button>
          <button
            type="button"
            disabled={!serviceId || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 rounded-2xl bg-biz-violet-500 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
          >
            {mutation.isPending ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Send Offer Sheet ─────────────────────────────────────────────────────────

const OFFER_TEMPLATES = [
  { id: "winback", label: "Win-back", body: (name: string) => `Hi ${name}! We miss you at the salon 💜 Come back this week and get 20% off your next visit. Book now: https://clitell.in` },
  { id: "birthday", label: "Birthday", body: (name: string) => `Happy Birthday ${name}! 🎂 Celebrate with a complimentary blow-dry on us. Valid this week. Book now: https://clitell.in` },
  { id: "offer", label: "Flash offer", body: (name: string) => `Hi ${name}, exclusive offer just for you 🌟 Flat ₹200 off on any service above ₹800 this weekend. Book now: https://clitell.in` },
];

function SendOfferSheet({ client, onClose }: { client: ClientSummary; onClose: () => void }) {
  const [templateId, setTemplateId] = useState(OFFER_TEMPLATES[0].id);
  const tpl = OFFER_TEMPLATES.find((t) => t.id === templateId)!;
  const message = tpl.body(client.fullName.split(" ")[0]);
  const waUrl = client.phone
    ? `https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-biz-ink">Send offer — {client.fullName}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>
        <div className="flex gap-2 pb-4">
          {OFFER_TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => setTemplateId(t.id)}
              className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", templateId === t.id ? "bg-biz-violet-500 text-white" : "bg-biz-bg text-biz-muted hover:text-biz-ink")}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-biz-bg p-4 text-sm leading-relaxed text-biz-ink whitespace-pre-wrap">{message}</div>
        {!client.phone && <p className="mt-2 text-xs text-biz-orange-600">No phone number saved — add one to enable WhatsApp.</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted hover:bg-biz-border">Cancel</button>
          {waUrl ? (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-biz-green-500 py-3 text-sm font-semibold text-white hover:opacity-90">
              <WhatsAppIcon /> Send via WhatsApp
            </a>
          ) : (
            <button disabled className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted-2 cursor-not-allowed">No phone number</button>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
