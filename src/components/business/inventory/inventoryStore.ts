"use client";

import { create } from "zustand";
import type { StockCategory } from "@/lib/inventory-seed";

export type InventoryTab = "stock" | "movements" | "orders";

type InventoryState = {
  tab: InventoryTab;
  search: string;
  category: "All" | StockCategory;
  reorderItemId: string | null;
};

type InventoryActions = {
  setTab: (tab: InventoryTab) => void;
  setSearch: (value: string) => void;
  setCategory: (value: "All" | StockCategory) => void;
  openReorder: (id: string) => void;
  closeReorder: () => void;
};

export const useInventoryStore = create<InventoryState & InventoryActions>((set) => ({
  tab: "stock",
  search: "",
  category: "All",
  reorderItemId: null,
  setTab: (tab) => set({ tab }),
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  openReorder: (id) => set({ reorderItemId: id }),
  closeReorder: () => set({ reorderItemId: null }),
}));
