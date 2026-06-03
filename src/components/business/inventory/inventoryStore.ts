"use client";

import { create } from "zustand";

export type InventoryTab = "stock" | "movements" | "orders";

type InventoryState = {
  tab: InventoryTab;
  search: string;
};

type InventoryActions = {
  setTab: (tab: InventoryTab) => void;
  setSearch: (value: string) => void;
};

export const useInventoryStore = create<InventoryState & InventoryActions>((set) => ({
  tab: "stock",
  search: "",
  setTab: (tab) => set({ tab }),
  setSearch: (search) => set({ search }),
}));
