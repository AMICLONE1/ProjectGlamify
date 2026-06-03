"use client";

import { create } from "zustand";

export type StaffTab = "roster" | "commissions" | "leave";

type StaffState = {
  tab: StaffTab;
};

type StaffActions = {
  setTab: (tab: StaffTab) => void;
};

export const useStaffStore = create<StaffState & StaffActions>((set) => ({
  tab: "roster",
  setTab: (tab) => set({ tab }),
}));
