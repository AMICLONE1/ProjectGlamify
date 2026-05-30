"use client";

import { useMemo } from "react";
import {
  findSupplier,
  inventoryItems,
  purchaseOrders,
  stockBadge,
  stockMovements,
  suppliers,
  type StockCategory,
} from "@/lib/inventory-seed";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import { useInventoryStore } from "./inventoryStore";
import { ReorderModal } from "./ReorderModal";

const CATEGORIES: ("All" | StockCategory)[] = [
  "All",
  "Hair color",
  "Aftercare",
  "Skincare",
  "Nails",
  "Tools",
  "Retail",
];

const badgeStyles: Record<"ok" | "low" | "critical" | "expiry", string> = {
  ok: "bg-biz-green-400/15 text-biz-green-500",
  low: "bg-biz-orange-300/25 text-biz-orange-600",
  critical: "bg-biz-pink-200/40 text-biz-pink-500",
  expiry: "bg-biz-violet-50 text-biz-violet-700",
};

const badgeLabel: Record<"ok" | "low" | "critical" | "expiry", string> = {
  ok: "OK",
  low: "Low",
  critical: "Critical",
  expiry: "Expiry < 30d",
};

const movementTone: Record<string, string> = {
  purchase: "text-biz-green-500",
  sale: "text-biz-violet-600",
  consumption: "text-biz-orange-600",
  adjustment: "text-biz-pink-500",
  transfer: "text-biz-magenta-500",
};

const poTone: Record<"draft" | "sent" | "received", string> = {
  draft: "bg-biz-bg text-biz-muted",
  sent: "bg-biz-orange-300/25 text-biz-orange-600",
  received: "bg-biz-green-400/15 text-biz-green-500",
};

export function InventoryBoard() {
  const tab = useInventoryStore((s) => s.tab);
  const search = useInventoryStore((s) => s.search);
  const category = useInventoryStore((s) => s.category);
  const setTab = useInventoryStore((s) => s.setTab);
  const setSearch = useInventoryStore((s) => s.setSearch);
  const setCategory = useInventoryStore((s) => s.setCategory);
  const openReorder = useInventoryStore((s) => s.openReorder);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventoryItems.filter((it) => {
      if (category !== "All" && it.category !== category) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q) ||
        it.brand.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  const alerts = useMemo(() => {
    return inventoryItems
      .filter((it) => stockBadge(it) !== "ok")
      .sort((a, b) => {
        const order = { critical: 0, expiry: 1, low: 2 } as const;
        return order[stockBadge(a) as "critical" | "expiry" | "low"] -
          order[stockBadge(b) as "critical" | "expiry" | "low"];
      });
  }, []);

  const inventoryValue = useMemo(() => {
    return inventoryItems.reduce((sum, it) => sum + it.currentStock * it.costPrice, 0);
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Inventory</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {inventoryItems.length} products in stock
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Real-time stock, reorder alerts, expiry, and purchase orders.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-biz-bg px-4 py-2 text-xs text-biz-muted">
          Inventory value · <span className="font-bold text-biz-ink">{formatINR(inventoryValue)}</span>
        </div>
      </header>

      {alerts.length > 0 && (
        <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-biz-pink-500">Stock alerts</p>
            <span className="rounded-full bg-biz-pink-200/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-biz-pink-500">
              {alerts.length} need attention
            </span>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.slice(0, 6).map((it) => {
              const badge = stockBadge(it);
              return (
                <li key={it.id} className="rounded-2xl bg-biz-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{it.brand}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-biz-ink">{it.name}</p>
                      <p className="mt-1 text-xs text-biz-muted">
                        Stock {it.currentStock}{it.unit !== "unit" ? ` ${it.unit}` : ""} · Reorder at {it.reorderLevel}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        badgeStyles[badge]
                      )}
                    >
                      {badgeLabel[badge]}
                    </span>
                  </div>
                  {badge === "expiry" && it.nearestExpiry && (
                    <p className="mt-2 text-[11px] text-biz-violet-600">
                      Nearest expiry · {it.nearestExpiry} ({it.daysToExpiry} days)
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => openReorder(it.id)}
                    className="mt-3 rounded-full bg-biz-violet-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-biz-violet-600"
                  >
                    Raise PO
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex w-fit items-center gap-1 rounded-full bg-biz-bg p-1">
        <TabButton active={tab === "stock"} onClick={() => setTab("stock")}>Stock</TabButton>
        <TabButton active={tab === "movements"} onClick={() => setTab("movements")}>Movements</TabButton>
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Purchase orders</TabButton>
      </div>

      {tab === "stock" && (
        <StockTab
          filteredItems={filteredItems}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          openReorder={openReorder}
        />
      )}
      {tab === "movements" && <MovementsTab />}
      {tab === "orders" && <OrdersTab />}

      <ReorderModal />
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

function StockTab({
  filteredItems,
  search,
  setSearch,
  category,
  setCategory,
  openReorder,
}: {
  filteredItems: typeof inventoryItems;
  search: string;
  setSearch: (v: string) => void;
  category: "All" | StockCategory;
  setCategory: (v: "All" | StockCategory) => void;
  openReorder: (id: string) => void;
}) {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
          <SearchIcon className="h-4 w-4 text-biz-muted-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, or brand…"
            className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-xs text-biz-muted-2 hover:text-biz-ink">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-full bg-biz-bg p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                category === cat ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
              <th className="px-3 py-3 font-semibold">Product</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Stock</th>
              <th className="px-3 py-3 font-semibold">Cost</th>
              <th className="px-3 py-3 font-semibold">Supplier</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((it) => {
              const supplier = findSupplier(it.supplierId);
              const badge = stockBadge(it);
              return (
                <tr key={it.id} className="border-b border-biz-border hover:bg-biz-bg">
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-biz-ink">{it.name}</p>
                      <p className="font-mono text-[11px] text-biz-muted-2">{it.sku} · {it.brand}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-biz-bg px-2 py-0.5 text-[10px] uppercase tracking-wider text-biz-muted">
                      {it.category}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-biz-ink">
                      {it.currentStock}
                      <span className="ml-1 text-xs font-medium text-biz-muted-2">
                        {it.unit === "unit" ? "pcs" : it.unit}
                      </span>
                    </p>
                    <p className="text-[11px] text-biz-muted-2">Reorder at {it.reorderLevel}</p>
                  </td>
                  <td className="px-3 py-3 text-biz-ink">{it.costPrice > 0 ? formatINR(it.costPrice) : "—"}</td>
                  <td className="px-3 py-3 text-biz-ink">{supplier?.name ?? "—"}</td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", badgeStyles[badge])}>
                      {badgeLabel[badge]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openReorder(it.id)}
                      className="rounded-full bg-biz-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-biz-muted-2">
                  No products match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MovementsTab() {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <p className="text-xs font-medium text-biz-violet-600">Stock movements</p>
      <p className="mt-1 text-sm text-biz-muted">Every purchase, sale, consumption, and adjustment.</p>
      <ul className="mt-5 space-y-2">
        {stockMovements.map((m) => {
          const item = inventoryItems.find((i) => i.id === m.itemId);
          if (!item) return null;
          const sign = m.quantity >= 0 ? "+" : "";
          return (
            <li key={m.id} className="grid grid-cols-[6rem_1fr_auto] items-center gap-4 rounded-2xl bg-biz-bg px-4 py-3">
              <span className={cn("text-[11px] font-semibold uppercase tracking-wider", movementTone[m.type])}>
                {m.type}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-biz-ink">{item.name}</p>
                <p className="truncate text-xs text-biz-muted-2">{m.reference} · {m.staffName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-biz-ink">
                  {sign}{m.quantity}
                  <span className="ml-1 text-xs font-medium text-biz-muted-2">
                    {item.unit === "unit" ? "pcs" : item.unit}
                  </span>
                </p>
                <p className="text-[11px] text-biz-muted-2">{m.at}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OrdersTab() {
  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-biz-violet-600">Purchase orders</p>
        <span className="text-xs text-biz-muted-2">{purchaseOrders.length} total</span>
      </div>
      <ul className="mt-5 space-y-3">
        {purchaseOrders.map((po) => {
          const supplier = findSupplier(po.supplierId);
          return (
            <li key={po.id} className="rounded-2xl bg-biz-bg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                    {po.id.toUpperCase()} · {supplier?.name}
                  </p>
                  <p className="mt-1 font-semibold text-biz-ink">{po.itemName}</p>
                  <p className="text-xs text-biz-muted">
                    Qty {po.quantity} × {formatINR(po.unitCost)} = {formatINR(po.quantity * po.unitCost)} · Raised by {po.raisedBy}
                  </p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider", poTone[po.status])}>
                  {po.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-biz-muted">{po.expectedAt}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs text-biz-muted-2">
        Suppliers wired: {suppliers.map((s) => s.name).join(" · ")}.
      </p>
    </section>
  );
}
