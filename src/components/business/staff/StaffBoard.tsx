"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi, appointmentsApi, type StaffMember, type UpcomingAppointment } from "@/lib/api-client";
import { getUser } from "@/lib/session";
import { cn } from "@/lib/cn";
import { useStaffStore } from "./staffStore";
import { Skeleton } from "@/components/ui/Skeleton";

function initialsOf(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "G";
}

export function StaffBoard() {
  const queryClient = useQueryClient();
  const tab = useStaffStore((s) => s.tab);
  const setTab = useStaffStore((s) => s.setTab);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => staffApi.list() });
  const roster: StaffMember[] = data?.staff ?? [];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Staff</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {isLoading ? "Loading…" : `${roster.length} team member${roster.length === 1 ? "" : "s"}`}
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">Manage your team, specialities, and commissions.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
        >
          + Add team member
        </button>
      </header>

      <div className="flex w-fit items-center gap-1 rounded-full bg-biz-bg p-1">
        <TabButton active={tab === "roster"} onClick={() => setTab("roster")}>Team</TabButton>
        <TabButton active={tab === "commissions"} onClick={() => setTab("commissions")}>Commissions</TabButton>
        <TabButton active={tab === "leave"} onClick={() => setTab("leave")}>Leave</TabButton>
      </div>

      {tab === "roster" && (
        <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
          {isLoading ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="rounded-2xl bg-biz-bg p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="skeleton-on-muted h-11 w-11 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="skeleton-on-muted h-4 w-24 rounded-full" />
                      <Skeleton className="skeleton-on-muted h-3 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Skeleton className="skeleton-on-muted h-3 w-32 rounded-full" />
                    <Skeleton className="skeleton-on-muted h-3 w-28 rounded-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : roster.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
              <p className="text-sm font-medium text-biz-ink">No team members yet</p>
              <p className="mt-1 max-w-sm text-xs text-biz-muted">Add your stylists, therapists, and front-desk staff so they can be booked.</p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roster.map((m) => (
                <li key={m.id} className="rounded-2xl bg-biz-bg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-biz-violet-50 text-sm font-bold text-biz-violet-700">
                      {initialsOf(m.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-biz-ink">{m.fullName}</p>
                      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{m.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-biz-muted">
                    {m.staffDetail?.speciality && <p>{m.staffDetail.speciality}</p>}
                    <p className="truncate">{m.email}</p>
                    {m.staffDetail && <p>Commission · {m.staffDetail.commissionPct}%</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "commissions" && <CommissionsPanel roster={roster} />}
      {tab === "leave" && (
        <EmptyTab title="Leave requests" body="Staff leave requests will show up here for approval. Coming soon." />
      )}

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["staff"] }); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function EmptyTab({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <p className="text-xs font-medium text-biz-violet-600">{title}</p>
      <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
        <p className="text-sm font-medium text-biz-ink">Nothing here yet</p>
        <p className="mt-1 max-w-sm text-xs text-biz-muted">{body}</p>
      </div>
    </section>
  );
}

// ─── Commissions Panel ────────────────────────────────────────────────────────

function CommissionsPanel({ roster }: { roster: StaffMember[] }) {
  const now = new Date();
  const mtdFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const mtdTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ["appointments-mtd"],
    queryFn: () => appointmentsApi.list({ from: mtdFrom, to: mtdTo, status: "completed", limit: 200 } as Parameters<typeof appointmentsApi.list>[0]),
  });

  const appointments: UpcomingAppointment[] = data?.appointments ?? [];

  const rows = useMemo(() => {
    return roster
      .filter((m) => m.staffDetail?.commissionPct && m.staffDetail.commissionPct > 0)
      .map((m) => {
        const myApts = appointments.filter((a) => a.staff?.user.id === m.id);
        const revenue = myApts.reduce((sum, a) => sum + a.items.reduce((s, it) => {
          const price = (it as unknown as { price?: number }).price ?? (it.service as unknown as { price?: number })?.price ?? 0;
          return s + price;
        }, 0), 0);
        const commission = Math.round(revenue * (m.staffDetail!.commissionPct / 100));
        return { member: m, apts: myApts.length, revenue, commission };
      })
      .sort((a, b) => b.commission - a.commission);
  }, [roster, appointments]);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0);

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-biz-violet-500 border-t-transparent" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Commissions</p>
          <p className="mt-0.5 text-sm text-biz-muted">Month-to-date · completed appointments</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">Total payable</p>
          <p className="font-display text-xl font-bold text-biz-ink">{fmt(totalCommission)}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm font-medium text-biz-ink">No commission data yet</p>
          <p className="mt-1 text-xs text-biz-muted">Set a commission % on each staff member and complete appointments to see payouts here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                <th className="px-3 py-2 font-semibold">Staff</th>
                <th className="px-3 py-2 font-semibold text-right">Appts</th>
                <th className="px-3 py-2 font-semibold text-right">Revenue</th>
                <th className="px-3 py-2 font-semibold text-right">Rate</th>
                <th className="px-3 py-2 font-semibold text-right">Commission</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member: m, apts, revenue, commission }) => (
                <tr key={m.id} className="border-b border-biz-border hover:bg-biz-bg">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biz-violet-50 text-xs font-bold text-biz-violet-700">
                        {m.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-biz-ink">{m.fullName}</p>
                        <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{m.staffDetail?.speciality ?? m.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-biz-ink">{apts}</td>
                  <td className="px-3 py-3 text-right text-biz-muted">{fmt(revenue)}</td>
                  <td className="px-3 py-3 text-right text-biz-muted">{m.staffDetail!.commissionPct}%</td>
                  <td className="px-3 py-3 text-right font-bold text-biz-violet-600">{fmt(commission)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-biz-border bg-biz-bg">
                <td className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-biz-muted-2" colSpan={2}>Total</td>
                <td className="px-3 py-3 text-right font-semibold text-biz-ink">{fmt(totalRevenue)}</td>
                <td />
                <td className="px-3 py-3 text-right font-bold text-biz-ink">{fmt(totalCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AddStaffModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", role: "staff" as const,
    password: "Glamify@123", speciality: "", commissionPct: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => {
      const user = getUser();
      if (!user?.locationId) throw new Error("No location configured for this account.");
      return staffApi.create({ ...form, locationId: user.locationId });
    },
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to add staff"),
  });

  const inputCls = "mt-1 w-full rounded-xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-biz-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-biz-ink">Add team member</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-biz-bg px-3 py-1 text-xs font-semibold text-biz-muted hover:bg-biz-border">Close</button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-biz-muted">Full name
            <input className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Anjali Rao" />
          </label>
          <label className="block text-xs text-biz-muted">Email (used to log in)
            <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="anjali@salon.com" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-biz-muted">Phone
              <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
            </label>
            <label className="block text-xs text-biz-muted">Commission %
              <input type="number" min={0} max={100} className={inputCls} value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: Number(e.target.value) || 0 })} />
            </label>
          </div>
          <label className="block text-xs text-biz-muted">Speciality
            <input className={inputCls} value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} placeholder="Hair colour, styling" />
          </label>
          <label className="block text-xs text-biz-muted">Temporary password
            <input className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-biz-pink-500">{error}</p>}
        <button
          type="button"
          onClick={() => {
            setError(null);
            if (!form.fullName.trim()) { setError("Name is required"); return; }
            if (!form.email.trim()) { setError("Email is required"); return; }
            create.mutate();
          }}
          disabled={create.isPending}
          className="mt-5 w-full rounded-full bg-biz-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
        >
          {create.isPending ? "Saving…" : "Add team member"}
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
        active ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink"
      )}
    >
      {children}
    </button>
  );
}
