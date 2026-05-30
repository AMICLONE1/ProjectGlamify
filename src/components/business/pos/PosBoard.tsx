"use client";

import { useMemo, useState } from "react";
import { clients, formatINR, products, services } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import { calculateTotals, getCartClient, usePosStore, type PaymentMethod } from "./posStore";

const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))] as const;
type Tab = "services" | "products";

const methodLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
};

const methodTone: Record<PaymentMethod, string> = {
  cash: "bg-biz-green-400/15 text-biz-green-500",
  upi: "bg-biz-violet-50 text-biz-violet-700",
  card: "bg-biz-orange-300/25 text-biz-orange-600",
};

export function PosBoard() {
  const [tab, setTab] = useState<Tab>("services");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);

  const {
    clientId,
    items,
    discountPercent,
    tip,
    payments,
    notes,
    setClient,
    addService,
    addProduct,
    updateQuantity,
    removeItem,
    setDiscountPercent,
    setTip,
    addPayment,
    removePayment,
    setNotes,
    reset,
  } = usePosStore();

  const totals = useMemo(
    () => calculateTotals(items, discountPercent, tip, payments),
    [items, discountPercent, tip, payments]
  );
  const cartClient = getCartClient(clientId);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    });
  }, [search, category]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [search]);

  function handleSettleRemaining(method: PaymentMethod) {
    if (totals.due <= 0) return;
    addPayment({ method, amount: Math.round(totals.due) });
  }

  function handleCompleteSale() {
    if (totals.due > 0.01) return;
    setShowInvoice(true);
  }

  function handleResetSale() {
    reset();
    setShowInvoice(false);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">POS · Checkout</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">New sale</h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Pick a client, add services and products, take payment, generate a GST invoice.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetSale}
            className="rounded-full bg-biz-bg px-4 py-2 text-xs font-semibold text-biz-ink hover:bg-biz-border"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <div className="flex w-fit items-center gap-1 rounded-full bg-biz-bg p-1">
              <TabButton active={tab === "services"} onClick={() => setTab("services")}>
                Services
              </TabButton>
              <TabButton active={tab === "products"} onClick={() => setTab("products")}>
                Products
              </TabButton>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
                <SearchIcon className="h-4 w-4 text-biz-muted-2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "services" ? "Search services…" : "Search products by name, brand, SKU…"}
                  className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
                />
              </div>
              {tab === "services" && (
                <div className="flex flex-wrap items-center gap-1 rounded-full bg-biz-bg p-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        category === cat
                          ? "bg-biz-surface text-biz-ink shadow-sm"
                          : "text-biz-muted hover:text-biz-ink"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tab === "services" &&
                filteredServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addService(s)}
                    className="group rounded-2xl bg-biz-bg p-4 text-left transition-colors hover:bg-biz-violet-50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">
                      {s.category}
                    </p>
                    <p className="mt-1 font-semibold text-biz-ink">{s.name}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-biz-muted">{s.durationMinutes} min</span>
                      <span className="font-bold text-biz-ink">{formatINR(s.price)}</span>
                    </div>
                  </button>
                ))}

              {tab === "products" &&
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="group rounded-2xl bg-biz-bg p-4 text-left transition-colors hover:bg-biz-violet-50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">
                      {p.brand}
                    </p>
                    <p className="mt-1 font-semibold text-biz-ink">{p.name}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-biz-muted">{p.sku}</span>
                      <span className="font-bold text-biz-ink">{formatINR(p.retailPrice)}</span>
                    </div>
                  </button>
                ))}

              {tab === "services" && filteredServices.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">
                  No services match this filter.
                </div>
              )}
              {tab === "products" && filteredProducts.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">
                  No products match this filter.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <p className="text-xs font-medium text-biz-violet-600">Client</p>
            <select
              value={clientId ?? ""}
              onChange={(e) => setClient(e.target.value || null)}
              className="mt-3 w-full appearance-none rounded-2xl bg-biz-bg px-4 py-3 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
            >
              <option value="">Walk-in (no profile)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </option>
              ))}
            </select>
            {cartClient && (
              <div className="mt-3 rounded-2xl bg-biz-violet-50 p-3 text-xs">
                <p className="font-semibold text-biz-ink">{cartClient.name}</p>
                <p className="mt-0.5 text-biz-muted">
                  {cartClient.totalVisits} visits · {formatINR(cartClient.totalSpend)} lifetime · {cartClient.loyaltyPoints} pts
                </p>
                {cartClient.allergies.length > 0 && (
                  <p className="mt-1 text-biz-pink-500">⚠ {cartClient.allergies.join(", ")}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-biz-violet-600">Cart</p>
              <span className="text-xs text-biz-muted-2">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-biz-border p-5 text-center text-sm text-biz-muted">
                Add services or products to start a sale.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {items.map((it) => (
                  <li key={it.key} className="rounded-2xl bg-biz-bg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                          {it.kind}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-biz-ink">{it.name}</p>
                        <p className="mt-0.5 text-xs text-biz-muted">
                          {formatINR(it.unitPrice)} · GST {it.taxRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-biz-ink">{formatINR(it.unitPrice * it.quantity)}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(it.key)}
                          className="mt-1 text-[10px] uppercase tracking-wider text-biz-pink-500 hover:text-biz-magenta-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-biz-surface">
                      <QtyButton onClick={() => updateQuantity(it.key, -1)}>−</QtyButton>
                      <span className="min-w-[2rem] px-2 text-center text-sm font-semibold text-biz-ink">
                        {it.quantity}
                      </span>
                      <QtyButton onClick={() => updateQuantity(it.key, 1)}>+</QtyButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs">
                <span className="uppercase tracking-wider text-biz-muted-2">Discount %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-2xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
                />
              </label>
              <label className="block text-xs">
                <span className="uppercase tracking-wider text-biz-muted-2">Tip ₹</span>
                <input
                  type="number"
                  min={0}
                  value={tip}
                  onChange={(e) => setTip(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-2xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
                />
              </label>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-biz-bg p-4 text-sm">
              <Row label="Subtotal" value={formatINR(totals.subtotal)} />
              {totals.discountAmount > 0 && (
                <Row label={`Discount (${discountPercent}%)`} value={`- ${formatINR(totals.discountAmount)}`} tone="pink" />
              )}
              <Row label="CGST" value={formatINR(totals.cgst)} />
              <Row label="SGST" value={formatINR(totals.sgst)} />
              {totals.tip > 0 && <Row label="Tip" value={formatINR(totals.tip)} />}
              <div className="mt-3 flex items-center justify-between border-t border-biz-border pt-3 text-base font-bold text-biz-ink">
                <span>Total</span>
                <span>{formatINR(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <p className="text-xs font-medium text-biz-violet-600">Payment</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {(["cash", "upi", "card"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={totals.due <= 0}
                  onClick={() => handleSettleRemaining(m)}
                  className={cn(
                    "rounded-full px-3 py-2 font-semibold uppercase tracking-wider transition-colors",
                    methodTone[m],
                    "disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-110"
                  )}
                >
                  {methodLabel[m]}
                </button>
              ))}
            </div>

            {payments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl bg-biz-bg px-3 py-2 text-xs"
                  >
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        methodTone[p.method]
                      )}
                    >
                      {methodLabel[p.method]}
                    </span>
                    <span className="font-semibold text-biz-ink">{formatINR(p.amount)}</span>
                    <button
                      type="button"
                      onClick={() => removePayment(p.id)}
                      className="text-[10px] uppercase tracking-wider text-biz-pink-500 hover:text-biz-magenta-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-biz-bg px-3 py-2 text-xs">
              <span className="uppercase tracking-wider text-biz-muted-2">Due</span>
              <span
                className={cn(
                  "font-bold",
                  totals.due > 0.01 ? "text-biz-orange-600" : "text-biz-green-500"
                )}
              >
                {formatINR(Math.max(0, totals.due))}
              </span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for this sale (optional)…"
              rows={2}
              className="mt-3 w-full rounded-2xl bg-biz-bg px-3 py-2 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
            />

            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={items.length === 0 || totals.due > 0.01}
              className="mt-4 w-full rounded-full bg-biz-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {items.length === 0
                ? "Add items to begin"
                : totals.due > 0.01
                ? `Collect ${formatINR(totals.due)} to finish`
                : "Generate GST invoice"}
            </button>
          </div>
        </aside>
      </div>

      {showInvoice && (
        <InvoicePreview
          totals={totals}
          items={items}
          clientName={cartClient?.name ?? "Walk-in"}
          notes={notes}
          payments={payments}
          onClose={handleResetSale}
        />
      )}
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

function QtyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 w-7 rounded-full text-sm font-bold text-biz-ink hover:bg-biz-bg"
    >
      {children}
    </button>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "pink" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-biz-muted">{label}</span>
      <span className={cn("font-semibold", tone === "pink" ? "text-biz-pink-500" : "text-biz-ink")}>
        {value}
      </span>
    </div>
  );
}

function InvoicePreview({
  totals,
  items,
  clientName,
  notes,
  payments,
  onClose,
}: {
  totals: ReturnType<typeof calculateTotals>;
  items: ReturnType<typeof usePosStore.getState>["items"];
  clientName: string;
  notes: string;
  payments: ReturnType<typeof usePosStore.getState>["payments"];
  onClose: () => void;
}) {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl rounded-3xl bg-biz-surface p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-biz-green-500">Invoice generated</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-biz-ink">{invoiceNumber}</h2>
            <p className="mt-1 text-xs text-biz-muted-2">Bandra Branch · GSTIN: 27ABCDE1234F1Z5</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-biz-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-biz-muted hover:bg-biz-border"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-biz-bg p-4 text-sm">
          <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">Billed to</p>
          <p className="mt-1 font-semibold text-biz-ink">{clientName}</p>
          <p className="mt-0.5 text-xs text-biz-muted-2">
            {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <ul className="mt-4 divide-y divide-biz-border">
          {items.map((it) => (
            <li key={it.key} className="flex items-start justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-biz-ink">{it.name}</p>
                <p className="text-xs text-biz-muted-2">
                  {it.quantity} × {formatINR(it.unitPrice)} · GST {it.taxRate}%
                </p>
              </div>
              <span className="font-semibold text-biz-ink">{formatINR(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1.5 border-t border-biz-border pt-3 text-sm">
          <div className="flex justify-between text-biz-muted">
            <span>Subtotal</span>
            <span>{formatINR(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-biz-pink-500">
              <span>Discount</span>
              <span>- {formatINR(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-biz-muted">
            <span>CGST</span>
            <span>{formatINR(totals.cgst)}</span>
          </div>
          <div className="flex justify-between text-biz-muted">
            <span>SGST</span>
            <span>{formatINR(totals.sgst)}</span>
          </div>
          {totals.tip > 0 && (
            <div className="flex justify-between text-biz-muted">
              <span>Tip</span>
              <span>{formatINR(totals.tip)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-biz-border pt-2 text-base font-bold text-biz-ink">
            <span>Total</span>
            <span>{formatINR(totals.grandTotal)}</span>
          </div>
        </div>

        {payments.length > 0 && (
          <div className="mt-4 rounded-2xl bg-biz-bg p-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-biz-muted-2">Paid via</p>
            <ul className="mt-2 space-y-1">
              {payments.map((p) => (
                <li key={p.id} className="flex justify-between text-biz-ink">
                  <span className="capitalize">{methodLabel[p.method]}</span>
                  <span>{formatINR(p.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes && (
          <div className="mt-4 rounded-2xl bg-biz-bg p-3 text-xs text-biz-muted">
            <p className="font-semibold uppercase tracking-wider text-biz-muted-2">Notes</p>
            <p className="mt-1">{notes}</p>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-biz-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-biz-violet-600"
          >
            Done · Start new sale
          </button>
        </div>
      </div>
    </div>
  );
}
