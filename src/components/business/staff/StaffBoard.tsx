"use client";

import { useMemo } from "react";
import {
  computeMonthlyPayout,
  shiftKindLabel,
  weekdays,
  type ShiftKind,
  type StaffMember,
} from "@/lib/staff-seed";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { useStaffStore } from "./staffStore";

const shiftStyles: Record<ShiftKind, string> = {
  off: "bg-biz-bg text-biz-muted-2",
  morning: "bg-biz-violet-50 text-biz-violet-700",
  afternoon: "bg-biz-orange-300/25 text-biz-orange-600",
  full: "bg-biz-green-400/15 text-biz-green-500",
  leave: "bg-biz-pink-200/40 text-biz-pink-500",
};

const leaveStatusStyles: Record<"pending" | "approved" | "declined", string> = {
  pending: "bg-biz-orange-300/25 text-biz-orange-600",
  approved: "bg-biz-green-400/15 text-biz-green-500",
  declined: "bg-biz-pink-200/40 text-biz-pink-500",
};

export function StaffBoard() {
  const tab = useStaffStore((s) => s.tab);
  const roster = useStaffStore((s) => s.roster);
  const leave = useStaffStore((s) => s.leave);
  const setTab = useStaffStore((s) => s.setTab);
  const cycleShift = useStaffStore((s) => s.cycleShift);
  const setLeaveStatus = useStaffStore((s) => s.setLeaveStatus);

  const totals = useMemo(() => {
    const totalRevenue = roster.reduce((sum, m) => sum + m.monthlyRevenue, 0);
    const totalCommission = roster.reduce(
      (sum, m) => sum + (m.monthlyRevenue * m.commissionPercent) / 100,
      0
    );
    const pendingLeave = leave.filter((l) => l.status === "pending").length;
    return { totalRevenue, totalCommission, pendingLeave };
  }, [roster, leave]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Staff</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {roster.length} team members
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Plan shifts, track performance, calculate commissions, and process leave.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <SummaryCard label="Team revenue · MTD" value={formatINR(totals.totalRevenue)} tone="violet" />
          <SummaryCard label="Commission due" value={formatINR(totals.totalCommission)} tone="orange" />
          <SummaryCard label="Pending leave" value={String(totals.pendingLeave)} tone="pink" />
        </div>
      </header>

      <div className="flex w-fit items-center gap-1 rounded-full bg-biz-bg p-1">
        <TabButton active={tab === "roster"} onClick={() => setTab("roster")}>
          Weekly roster
        </TabButton>
        <TabButton active={tab === "commissions"} onClick={() => setTab("commissions")}>
          Commissions
        </TabButton>
        <TabButton active={tab === "leave"} onClick={() => setTab("leave")}>
          Leave requests
        </TabButton>
      </div>

      {tab === "roster" && <RosterTab roster={roster} onCycle={cycleShift} />}
      {tab === "commissions" && <CommissionsTab roster={roster} />}
      {tab === "leave" && <LeaveTab leave={leave} onSet={setLeaveStatus} />}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "violet" | "orange" | "pink";
}) {
  const toneCls = {
    violet: "text-biz-violet-600",
    orange: "text-biz-orange-600",
    pink: "text-biz-pink-500",
  }[tone];
  return (
    <div className="rounded-2xl bg-biz-bg p-3">
      <p className="text-[9px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-biz-ink">{value}</p>
      <p className={cn("mt-1 text-[9px] font-semibold uppercase tracking-wider", toneCls)}>live</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

function RosterTab({
  roster,
  onCycle,
}: {
  roster: StaffMember[];
  onCycle: (id: string, day: number) => void;
}) {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Week of May 26 – Jun 1</p>
          <p className="mt-1 text-xs text-biz-muted-2">Click a cell to cycle: Off → 9–14 → 14–20 → 9–20 → Leave.</p>
        </div>
        <button className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600">
          Publish roster
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div
          className="grid min-w-[820px] gap-px overflow-hidden rounded-2xl bg-biz-border"
          style={{ gridTemplateColumns: "12rem repeat(7, minmax(7rem, 1fr))" }}
        >
          <div className="bg-biz-bg p-3 text-[10px] uppercase tracking-wider text-biz-muted-2">Member</div>
          {weekdays.map((d) => (
            <div
              key={d.short}
              className="bg-biz-bg p-3 text-center text-[10px] uppercase tracking-wider text-biz-muted-2"
            >
              {d.short}
            </div>
          ))}

          {roster.map((m) => (
            <RosterRow key={m.id} member={m} onCycle={onCycle} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        {(["off", "morning", "afternoon", "full", "leave"] as ShiftKind[]).map((k) => (
          <span
            key={k}
            className={cn("rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider", shiftStyles[k])}
          >
            {shiftKindLabel[k]}
          </span>
        ))}
      </div>
    </section>
  );
}

function RosterRow({
  member,
  onCycle,
}: {
  member: StaffMember;
  onCycle: (id: string, day: number) => void;
}) {
  return (
    <>
      <div className="bg-biz-surface p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-biz-violet-50 text-xs font-bold text-biz-violet-700">
            {member.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-biz-ink">{member.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{member.role}</p>
          </div>
        </div>
      </div>
      {member.shifts.map((sh) => (
        <button
          key={`${member.id}-${sh.dayIndex}`}
          type="button"
          onClick={() => onCycle(member.id, sh.dayIndex)}
          className={cn(
            "m-1 rounded-xl p-2 text-center text-[11px] font-semibold uppercase tracking-wider transition-all hover:brightness-95",
            shiftStyles[sh.kind]
          )}
        >
          {shiftKindLabel[sh.kind]}
        </button>
      ))}
    </>
  );
}

function CommissionsTab({ roster }: { roster: StaffMember[] }) {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <p className="text-xs font-medium text-biz-violet-600">Commissions · May 2026</p>
      <p className="mt-1 text-xs text-biz-muted-2">
        Base hourly × 8h × 22 working days + commission % of monthly service revenue.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
              <th className="px-3 py-3 font-semibold">Member</th>
              <th className="px-3 py-3 font-semibold">Services</th>
              <th className="px-3 py-3 font-semibold">Revenue</th>
              <th className="px-3 py-3 font-semibold">Base</th>
              <th className="px-3 py-3 font-semibold">Commission</th>
              <th className="px-3 py-3 font-semibold">Total payout</th>
              <th className="px-3 py-3 font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((m) => {
              const payout = computeMonthlyPayout(m);
              return (
                <tr key={m.id} className="border-b border-biz-border hover:bg-biz-bg">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-violet-50 text-xs font-bold text-biz-violet-700">
                        {m.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-biz-ink">{m.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                          {m.role} · {m.commissionPercent}% commission
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-biz-ink">{m.monthlyServices}</td>
                  <td className="px-3 py-3 text-biz-ink">{formatINR(m.monthlyRevenue)}</td>
                  <td className="px-3 py-3 text-biz-muted">{formatINR(payout.base)}</td>
                  <td className="px-3 py-3 text-biz-violet-600">{formatINR(payout.commission)}</td>
                  <td className="px-3 py-3 font-bold text-biz-ink">{formatINR(payout.total)}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-biz-orange-300/25 px-2 py-0.5 text-[11px] font-semibold text-biz-orange-600">
                      ★ {m.rating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeaveTab({
  leave,
  onSet,
}: {
  leave: ReturnType<typeof useStaffStore.getState>["leave"];
  onSet: (id: string, status: "pending" | "approved" | "declined") => void;
}) {
  const pending = leave.filter((l) => l.status === "pending");
  const decided = leave.filter((l) => l.status !== "pending");

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-biz-orange-600">Pending</p>
          <span className="text-xs text-biz-muted-2">{pending.length} awaiting</span>
        </div>
        <ul className="mt-4 space-y-3">
          {pending.length === 0 && (
            <li className="rounded-2xl border border-dashed border-biz-border p-5 text-center text-sm text-biz-muted-2">
              No pending requests right now.
            </li>
          )}
          {pending.map((req) => (
            <li key={req.id} className="rounded-2xl bg-biz-bg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-biz-ink">{req.staffName}</p>
                  <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                    {req.type} leave · {req.days} day{req.days > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-xs text-biz-muted">
                    {req.fromDate} → {req.toDate}
                  </p>
                  <p className="mt-2 text-sm text-biz-ink">{req.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSet(req.id, "approved")}
                    className="rounded-full bg-biz-green-400/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-green-500 hover:bg-biz-green-400/25"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onSet(req.id, "declined")}
                    className="rounded-full bg-biz-pink-200/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-pink-500 hover:bg-biz-pink-200/60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
        <p className="text-xs font-medium text-biz-violet-600">Decided</p>
        <ul className="mt-4 space-y-3">
          {decided.map((req) => (
            <li key={req.id} className="flex items-start justify-between gap-3 rounded-2xl bg-biz-bg p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-biz-ink">{req.staffName}</p>
                <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                  {req.type} · {req.fromDate} → {req.toDate} · {req.days} day{req.days > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-xs text-biz-muted">{req.reason}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  leaveStatusStyles[req.status]
                )}
              >
                {req.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
