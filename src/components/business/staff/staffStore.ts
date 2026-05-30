"use client";

import { create } from "zustand";
import {
  leaveRequests as seedLeave,
  staffRoster as seedRoster,
  shiftKindOrder,
  type LeaveRequest,
  type ShiftKind,
  type StaffMember,
} from "@/lib/staff-seed";

export type StaffTab = "roster" | "commissions" | "leave";

type StaffState = {
  tab: StaffTab;
  roster: StaffMember[];
  leave: LeaveRequest[];
};

type StaffActions = {
  setTab: (tab: StaffTab) => void;
  cycleShift: (staffId: string, dayIndex: number) => void;
  setLeaveStatus: (id: string, status: LeaveRequest["status"]) => void;
};

function nextShift(current: ShiftKind): ShiftKind {
  const idx = shiftKindOrder.indexOf(current);
  return shiftKindOrder[(idx + 1) % shiftKindOrder.length];
}

export const useStaffStore = create<StaffState & StaffActions>((set) => ({
  tab: "roster",
  roster: seedRoster,
  leave: seedLeave,

  setTab: (tab) => set({ tab }),

  cycleShift: (staffId, dayIndex) =>
    set((state) => ({
      roster: state.roster.map((m) =>
        m.id !== staffId
          ? m
          : {
              ...m,
              shifts: m.shifts.map((sh) =>
                sh.dayIndex === dayIndex ? { ...sh, kind: nextShift(sh.kind) } : sh
              ),
            }
      ),
    })),

  setLeaveStatus: (id, status) =>
    set((state) => ({
      leave: state.leave.map((req) => (req.id === id ? { ...req, status } : req)),
    })),
}));
