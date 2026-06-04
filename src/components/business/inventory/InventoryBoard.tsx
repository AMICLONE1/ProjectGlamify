"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, api, type Product } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import { useInventoryStore } from "./inventoryStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUser } from "@/lib/session";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function stockBadge(p: Product): "ok" | "low" | "critical" {
  if (p.stockQty <= 0) return "critical";
  if (p.stockQty <= p.reorderLevel) return "low";
  return "ok";
}

const badgeStyles: Record<"ok" | "low" | "critical", string> = {
  ok: "bg-biz-green-400/15 text-biz-green-500",
  low: "bg-biz-orange-300/25 text-biz-orange-600",
  critical: "bg-biz-pink-200/40 text-biz-pink-500",
};
const badgeLabel: Record<"ok" | "low" | "critical", string> = {
  ok: "OK", low: "Low", critical: "Out of stock",
};

export function InventoryBoard() {
  const queryClient = useQueryClient();
  const tab = useInventoryStore((s) => s.tab);
  const search = useInventoryStore((s) => s.search);
  const setTab = useInventoryStore((s) => s.setTab);
  const setSearch = useInventoryStore((s) => s.setSearch);

  const [showAdd, setShowAdd] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: () => inventoryApi.list() });
  const products: Product[] = data?.products ?? [];

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))],
    [products]
  );
  const [category, setCategory] = useState("All");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((it) => {
      if (category !== "All" && it.category !== category) return false;
      if (!q) return true;
      return it.name.toLowerCase().includes(q) || (it.sku ?? "").toLowerCase().includes(q);
    });
  }, [products, search, category]);

  const alerts = useMemo(() => products.filter((it) => stockBadge(it) !== "ok"), [products]);
  const inventoryValue = useMemo(
    () => products.reduce((sum, it) => sum + it.stockQty * it.costPrice, 0),
    [products]
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Inventory</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            {isLoading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"} in stock`}
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">Real-time stock and reorder alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-biz-bg px-4 py-2 text-xs text-biz-muted">
            Inventory value · <span className="font-bold text-biz-ink">{formatINR(inventoryValue)}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
          >
            + Add product
          </button>
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
                      <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{it.category ?? "Product"}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-biz-ink">{it.name}</p>
                      <p className="mt-1 text-xs text-biz-muted">
                        Stock {it.stockQty} {it.unit} · Reorder at {it.reorderLevel}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", badgeStyles[badge])}>
                      {badgeLabel[badge]}
                    </span>
                  </div>
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
        <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
              <SearchIcon className="h-4 w-4 text-biz-muted-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or SKU…"
                className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
              />
            </div>
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center gap-1 rounded-full bg-biz-bg p-1">
                {categories.map((cat) => (
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
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                  <th className="px-3 py-3 font-semibold">Product</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Stock</th>
                  <th className="px-3 py-3 font-semibold">Cost</th>
                  <th className="px-3 py-3 font-semibold">Sell price</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-biz-border">
                    <td colSpan={7} className="px-3 py-3">
                      <Skeleton className="h-8 rounded-xl" />
                    </td>
                  </tr>
                ))}
                {filteredItems.map((it) => {
                  const badge = stockBadge(it);
                  return (
                    <tr key={it.id} className="border-b border-biz-border hover:bg-biz-bg">
                      <td className="px-3 py-3">
                        <p className="truncate font-semibold text-biz-ink">{it.name}</p>
                        <p className="font-mono text-[11px] text-biz-muted-2">{it.sku ?? "—"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-biz-bg px-2 py-0.5 text-[10px] uppercase tracking-wider text-biz-muted">
                          {it.category ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-biz-ink">{it.stockQty}<span className="ml-1 text-xs font-medium text-biz-muted-2">{it.unit}</span></p>
                        <p className="text-[11px] text-biz-muted-2">Reorder at {it.reorderLevel}</p>
                      </td>
                      <td className="px-3 py-3 text-biz-muted">{it.costPrice > 0 ? formatINR(it.costPrice) : "—"}</td>
                      <td className="px-3 py-3 font-semibold text-biz-ink">{it.sellPrice > 0 ? formatINR(it.sellPrice) : "—"}</td>
                      <td className="px-3 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", badgeStyles[badge])}>
                          {badgeLabel[badge]}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setAdjustProduct(it)}
                          className="rounded-full border border-biz-border px-3 py-1 text-[10px] font-semibold text-biz-muted hover:border-biz-violet-300 hover:text-biz-violet-600 transition-colors"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-biz-muted-2">
                      {products.length === 0 ? "No products yet. Click \"Add product\" to start tracking stock." : "No products match the current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "movements" && <MovementsPanel />}
      {tab === "orders" && (
        <EmptyTab title="Purchase orders" body="Raise and track supplier purchase orders here. Coming soon." />
      )}

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["inventory"] }); setShowAdd(false); }}
        />
      )}

      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setAdjustProduct(null);
          }}
        />
      )}
    </div>
  );
}

type StockMovement = {
  id: string; type: string; qty: number; note: string | null; createdAt: string;
  product: { id: string; name: string; unit: string };
};

const movementTypeLabel: Record<string, string> = {
  purchase: "Purchase", adjustment: "Adjustment", waste: "Waste / Damage",
  sale: "Sale", transfer: "Transfer",
};
const movementTypeTone: Record<string, string> = {
  purchase: "bg-biz-green-400/15 text-biz-green-500",
  adjustment: "bg-biz-violet-50 text-biz-violet-700",
  waste: "bg-biz-pink-200/40 text-biz-pink-500",
  sale: "bg-biz-orange-300/25 text-biz-orange-600",
  transfer: "bg-biz-bg text-biz-muted",
};

function MovementsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: () => api.get<{ movements: StockMovement[] }>("/inventory/movements"),
  });
  const movements = data?.movements ?? [];

  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <p className="text-xs font-medium text-biz-violet-600">Stock movements</p>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      ) : movements.length === 0 ? (
        <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm font-medium text-biz-ink">No movements yet</p>
          <p className="mt-1 max-w-sm text-xs text-biz-muted">Adjustments and purchases will appear here as you record them.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                <th className="px-3 py-3 font-semibold">Product</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Qty</th>
                <th className="px-3 py-3 font-semibold">Note</th>
                <th className="px-3 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b border-biz-border hover:bg-biz-bg">
                  <td className="px-3 py-3 font-semibold text-biz-ink">{m.product.name}</td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      movementTypeTone[m.type] ?? "bg-biz-bg text-biz-muted")}>
                      {movementTypeLabel[m.type] ?? m.type}
                    </span>
                  </td>
                  <td className={cn("px-3 py-3 font-mono font-semibold", m.qty > 0 ? "text-biz-green-500" : "text-biz-pink-500")}>
                    {m.qty > 0 ? "+" : ""}{m.qty} {m.product.unit}
                  </td>
                  <td className="px-3 py-3 text-biz-muted">{m.note ?? "—"}</td>
                  <td className="px-3 py-3 text-xs text-biz-muted-2">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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

function AddProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", category: "", unit: "pc", costPrice: 0, sellPrice: 0, stockQty: 0, reorderLevel: 0 });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => inventoryApi.create(form),
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to add product"),
  });

  const inputCls = "mt-1 w-full rounded-xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-biz-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-biz-ink">Add product</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-biz-bg px-3 py-1 text-xs font-semibold text-biz-muted hover:bg-biz-border">Close</button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-biz-muted">Name
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="L'Oréal Hair Color" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-biz-muted">Category
              <input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Hair color" />
            </label>
            <label className="block text-xs text-biz-muted">Unit
              <input className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pc" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-biz-muted">Cost price ₹
              <input type="number" min={0} className={inputCls} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) || 0 })} />
            </label>
            <label className="block text-xs text-biz-muted">Sell price ₹
              <input type="number" min={0} className={inputCls} value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) || 0 })} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-biz-muted">Stock qty
              <input type="number" className={inputCls} value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) || 0 })} />
            </label>
            <label className="block text-xs text-biz-muted">Reorder level
              <input type="number" className={inputCls} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) || 0 })} />
            </label>
          </div>
        </div>
        {error && <p className="mt-3 text-xs font-medium text-biz-pink-500">{error}</p>}
        <button
          type="button"
          onClick={() => { setError(null); if (!form.name.trim()) { setError("Name is required"); return; } create.mutate(); }}
          disabled={create.isPending}
          className="mt-5 w-full rounded-full bg-biz-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
        >
          {create.isPending ? "Saving…" : "Add product"}
        </button>
      </div>
    </div>
  );
}

// ─── Stock Adjust Modal ───────────────────────────────────────────────────────

const MOVE_TYPES: { id: "purchase" | "adjustment" | "waste"; label: string; sign: "+" | "-"; tone: string }[] = [
  { id: "purchase",   label: "Receive stock",  sign: "+", tone: "bg-biz-green-400/15 text-biz-green-500" },
  { id: "adjustment", label: "Manual adjust",  sign: "+", tone: "bg-biz-violet-50 text-biz-violet-700" },
  { id: "waste",      label: "Waste / damage", sign: "-", tone: "bg-biz-pink-200/40 text-biz-pink-500" },
];

function StockAdjustModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<"purchase" | "adjustment" | "waste">("purchase");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const move = MOVE_TYPES.find((m) => m.id === type)!;
  const delta = type === "waste" ? -Math.abs(qty) : Math.abs(qty);
  const newQty = product.stockQty + delta;

  const mutation = useMutation({
    mutationFn: () => {
      const user = getUser();
      if (!user?.locationId) throw new Error("No location configured.");
      if (qty <= 0) throw new Error("Quantity must be greater than 0.");
      return inventoryApi.adjust(product.id, { locationId: user.locationId, type, qty, note: note || undefined });
    },
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Adjustment failed"),
  });

  const inputCls = "w-full rounded-xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-biz-ink">Adjust stock</h2>
            <p className="text-xs text-biz-muted-2">{product.name} · currently {product.stockQty} {product.unit}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>

        <div className="space-y-4">
          {/* Movement type */}
          <div className="grid grid-cols-3 gap-2">
            {MOVE_TYPES.map((m) => (
              <button key={m.id} type="button" onClick={() => setType(m.id)}
                className={cn("rounded-2xl px-3 py-2.5 text-center text-xs font-semibold transition-colors border",
                  type === m.id ? `${m.tone} border-transparent` : "border-biz-border text-biz-muted hover:border-biz-violet-200 hover:text-biz-ink")}>
                <span className="block text-base">{m.sign}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">
              Quantity ({product.unit})
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-biz-bg text-lg font-bold text-biz-ink hover:bg-biz-border">−</button>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className={inputCls + " text-center"} />
              <button type="button" onClick={() => setQty((q) => q + 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-biz-bg text-lg font-bold text-biz-ink hover:bg-biz-border">+</button>
            </div>
          </div>

          {/* Preview new qty */}
          <div className="flex items-center justify-between rounded-2xl bg-biz-bg px-4 py-3 text-sm">
            <span className="text-biz-muted">New stock level</span>
            <span className={cn("font-bold", newQty < 0 ? "text-biz-pink-500" : newQty <= product.reorderLevel ? "text-biz-orange-600" : "text-biz-green-500")}>
              {newQty} {product.unit}
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Supplier name, reason…" className={inputCls} />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted hover:bg-biz-border">
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending || newQty < 0}
            onClick={() => { setError(null); mutation.mutate(); }}
            className="flex-1 rounded-2xl bg-biz-violet-500 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : `Save · ${move.sign}${qty} ${product.unit}`}
          </button>
        </div>
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
