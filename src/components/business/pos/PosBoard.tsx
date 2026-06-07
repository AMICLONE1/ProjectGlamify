"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import { api, clientsApi, servicesApi, inventoryApi, onboardingApi, type ClientSummary, type Service, type Product } from "@/lib/api-client";
import { getUser } from "@/lib/session";
import { calculateTotals, usePosStore, type PaymentMethod } from "./posStore";

type PosView = "new" | "history";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

type Tab = "services" | "products";

const methodLabel: Record<PaymentMethod, string> = { cash: "Cash", upi: "UPI", card: "Card" };
const methodTone: Record<PaymentMethod, string> = {
  cash: "bg-biz-green-400/15 text-biz-green-500",
  upi: "bg-biz-violet-50 text-biz-violet-700",
  card: "bg-biz-orange-300/25 text-biz-orange-600",
};

export function PosBoard() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [posView, setPosView] = useState<PosView>("new");
  const [tab, setTab] = useState<Tab>("services");
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [invoiceResult, setInvoiceResult] = useState<{ invoiceNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Real data ──
  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });
  const { data: productsData } = useQuery({ queryKey: ["inventory"], queryFn: () => inventoryApi.list() });
  const { data: clientsData } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list({ limit: 100 }) });
  // Storefront review link for the post-sale review nudge.
  const { data: onboarding } = useQuery({ queryKey: ["onboarding-progress"], queryFn: () => onboardingApi.progress(), staleTime: 5 * 60_000 });

  const services: Service[] = servicesData?.services ?? [];
  const products: Product[] = productsData?.products ?? [];
  const clients: ClientSummary[] = clientsData?.clients ?? [];

  const {
    clientId, items, discountPercent, tip, payments, notes,
    setClient, addService, addProduct, updateQuantity, updatePrice, removeItem,
    setDiscountPercent, setTip, addPayment, removePayment, setNotes, reset,
  } = usePosStore();

  // Auto-select client when arriving from calendar
  useEffect(() => {
    if (!clientsData?.clients.length || clientId) return;
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");
    if (!phone && !name) return;
    const match = clientsData.clients.find((c) =>
      (phone && c.phone === phone) ||
      (name && c.fullName.toLowerCase() === name.toLowerCase())
    );
    if (match) setClient(match.id);
  }, [clientsData, searchParams, clientId, setClient]);

  // Auto-add booked services when arriving from calendar check-in
  useEffect(() => {
    if (!servicesData?.services.length) return;
    const svcIds = searchParams.get("serviceIds");
    if (!svcIds) return;
    const ids = svcIds.split(",").filter(Boolean);
    if (!ids.length || items.length > 0) return; // don't overwrite if cart already has items
    for (const id of ids) {
      const svc = servicesData.services.find((s) => s.id === id);
      if (svc) addService({ id: svc.id, name: svc.name, price: svc.price, taxRate: svc.taxPct, priceType: svc.priceType, priceMax: svc.priceMax });
    }
  }, [servicesData, searchParams, items.length, addService]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.map((s) => s.category?.name).filter(Boolean) as string[]))],
    [services]
  );

  const totals = useMemo(
    () => calculateTotals(items, discountPercent, tip, payments),
    [items, discountPercent, tip, payments]
  );
  // Range/"from" services must have a final price entered before billing.
  const hasUnpriced = items.some((it) => it.openPrice && (!it.unitPrice || it.unitPrice <= 0));
  const cartClient = clients.find((c) => c.id === clientId);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (category !== "All" && s.category?.name !== category) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || (s.category?.name ?? "").toLowerCase().includes(q);
    });
  }, [services, search, category]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q);
    });
  }, [products, search]);

  // ── Submit real invoice ──
  const createInvoice = useMutation({
    mutationFn: async () => {
      const user = getUser();
      if (!user?.locationId) throw new Error("No location configured for this account.");
      if (!clientId) throw new Error("Select a client to bill (walk-ins must be saved first).");

      const lineItems = items.map((it) => ({
        serviceId: it.kind === "service" ? it.id : undefined,
        label: it.name,
        qty: it.quantity,
        unitPrice: it.unitPrice,
        discountPct: 0,
        taxPct: it.taxRate,
      }));

      const method = payments[0]?.method ?? "cash";
      return api.post<{ invoiceNumber: string }>("/invoices", {
        locationId: user.locationId,
        clientId,
        lineItems,
        discountAmt: totals.discountAmount,
        tipAmt: totals.tip,
        paymentMethod: method,
        notes: notes || undefined,
        markPaid: true,
      });
    },
    onSuccess: (inv) => {
      setInvoiceResult({ invoiceNumber: inv.invoiceNumber });
      setError(null);
      // Refresh dashboard + clients so revenue/charts update
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to create invoice"),
  });

  function handleSettleRemaining(method: PaymentMethod) {
    if (totals.due <= 0) return;
    addPayment({ method, amount: Math.round(totals.due) });
  }

  function handleResetSale() {
    reset();
    setInvoiceResult(null);
    setError(null);
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
          <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
            <PosViewBtn active={posView === "new"} onClick={() => setPosView("new")}>New sale</PosViewBtn>
            <PosViewBtn active={posView === "history"} onClick={() => setPosView("history")}>Invoice history</PosViewBtn>
          </div>
          {posView === "new" && (
            <button
              type="button"
              onClick={handleResetSale}
              className="rounded-full bg-biz-bg px-4 py-2 text-xs font-semibold text-biz-ink hover:bg-biz-border"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Banner when arriving from calendar check-in */}
      {posView === "new" && searchParams.get("phone") && (
        <div className="flex items-center gap-3 rounded-2xl bg-biz-green-400/15 px-5 py-3">
          <span className="text-biz-green-500 text-lg">✓</span>
          <div>
            <p className="text-sm font-semibold text-biz-green-700">
              Billing for {searchParams.get("name") ?? "walk-in"} · arrived from booking
            </p>
            <p className="text-xs text-biz-green-600">
              {searchParams.get("serviceIds")
                ? "Booked services pre-loaded in cart. Select payment method and generate invoice."
                : "Add services below, select payment method, and generate invoice."}
            </p>
          </div>
        </div>
      )}

      {posView === "history" && <InvoiceHistory />}

      {posView === "new" && <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <div className="flex w-fit items-center gap-1 rounded-full bg-biz-bg p-1">
              <TabButton active={tab === "services"} onClick={() => setTab("services")}>Services</TabButton>
              <TabButton active={tab === "products"} onClick={() => setTab("products")}>Products</TabButton>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full bg-biz-bg px-4 py-2.5 text-sm">
                <SearchIcon className="h-4 w-4 text-biz-muted-2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === "services" ? "Search services…" : "Search products by name, SKU…"}
                  className="w-full bg-transparent text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
                />
              </div>
              {tab === "services" && categories.length > 1 && (
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tab === "services" &&
                filteredServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addService({ id: s.id, name: s.name, price: s.price, taxRate: s.taxPct, priceType: s.priceType, priceMax: s.priceMax })}
                    className="group rounded-2xl bg-biz-bg p-4 text-left transition-colors hover:bg-biz-violet-50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">
                      {s.category?.name ?? "Service"}
                    </p>
                    <p className="mt-1 font-semibold text-biz-ink">{s.name}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-biz-muted">{s.durationMinutes} min</span>
                      <span className="font-bold text-biz-ink">
                        {s.priceType === "from" ? `${formatINR(s.price)}+`
                          : s.priceType === "range" && s.priceMax != null ? `${formatINR(s.price)}–${formatINR(s.priceMax)}`
                          : formatINR(s.price)}
                      </span>
                    </div>
                  </button>
                ))}

              {tab === "products" &&
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct({ id: p.id, name: p.name, retailPrice: p.sellPrice || p.costPrice, taxRate: 18 })}
                    className="group rounded-2xl bg-biz-bg p-4 text-left transition-colors hover:bg-biz-violet-50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">
                      {p.category ?? "Product"}
                    </p>
                    <p className="mt-1 font-semibold text-biz-ink">{p.name}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-biz-muted">{p.sku ?? "—"}</span>
                      <span className="font-bold text-biz-ink">{formatINR(p.sellPrice || p.costPrice)}</span>
                    </div>
                  </button>
                ))}

              {tab === "services" && filteredServices.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">
                  {services.length === 0 ? "No services yet. Add them in Storefront → Services." : "No services match this filter."}
                </div>
              )}
              {tab === "products" && filteredProducts.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">
                  {products.length === 0 ? "No products yet. Add them in Inventory." : "No products match this filter."}
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
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}{c.phone ? ` · ${c.phone}` : ""}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="mt-2 text-xs text-biz-muted">No clients yet. Add one in the Clients tab to bill them.</p>
            )}
            {cartClient && (
              <div className="mt-3 rounded-2xl bg-biz-violet-50 p-3 text-xs">
                <p className="font-semibold text-biz-ink">{cartClient.fullName}</p>
                <p className="mt-0.5 text-biz-muted">
                  {cartClient.totalVisits} visits · {formatINR(cartClient.totalSpend)} lifetime · {cartClient.loyaltyPoints} pts
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-biz-violet-600">Cart</p>
              <span className="text-xs text-biz-muted-2">{items.length} {items.length === 1 ? "item" : "items"}</span>
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
                        <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">{it.kind}</p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-biz-ink">{it.name}</p>
                        {it.openPrice ? (
                          <div className="mt-1.5">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-biz-surface px-2 py-1">
                              <span className="text-xs text-biz-muted">₹</span>
                              <input
                                type="number" min={0} value={it.unitPrice || ""}
                                onChange={(e) => updatePrice(it.key, Number(e.target.value))}
                                placeholder="Enter price"
                                className="w-20 bg-transparent text-sm font-semibold text-biz-ink focus:outline-none"
                              />
                            </div>
                            <p className="mt-0.5 text-[10px] text-biz-violet-600">
                              {it.priceMax ? `Range ₹${it.priceMin?.toLocaleString("en-IN")}–₹${it.priceMax.toLocaleString("en-IN")}` : `From ₹${it.priceMin?.toLocaleString("en-IN")}`} · set final price
                            </p>
                          </div>
                        ) : (
                          <p className="mt-0.5 text-xs text-biz-muted">{formatINR(it.unitPrice)} · GST {it.taxRate}%</p>
                        )}
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
                      <span className="min-w-[2rem] px-2 text-center text-sm font-semibold text-biz-ink">{it.quantity}</span>
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
                  type="number" min={0} max={100} value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-2xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
                />
              </label>
              <label className="block text-xs">
                <span className="uppercase tracking-wider text-biz-muted-2">Tip ₹</span>
                <input
                  type="number" min={0} value={tip}
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
                  <li key={p.id} className="flex items-center justify-between rounded-2xl bg-biz-bg px-3 py-2 text-xs">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", methodTone[p.method])}>
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
              <span className={cn("font-bold", totals.due > 0.01 ? "text-biz-orange-600" : "text-biz-green-500")}>
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

            {error && <p className="mt-3 text-xs font-medium text-biz-pink-500">{error}</p>}

            <button
              type="button"
              onClick={() => createInvoice.mutate()}
              disabled={items.length === 0 || totals.due > 0.01 || !clientId || hasUnpriced || createInvoice.isPending}
              className="mt-4 w-full rounded-full bg-biz-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createInvoice.isPending
                ? "Saving…"
                : items.length === 0
                ? "Add items to begin"
                : hasUnpriced
                ? "Set price for ranged services"
                : !clientId
                ? "Select a client"
                : totals.due > 0.01
                ? `Collect ${formatINR(totals.due)} to finish`
                : "Generate GST invoice"}
            </button>
          </div>
        </aside>
      </div>}

      {invoiceResult && (
        <InvoiceConfirmation
          invoiceNumber={invoiceResult.invoiceNumber}
          totals={totals}
          items={items}
          clientName={cartClient?.fullName ?? "Client"}
          clientPhone={cartClient?.phone ?? null}
          reviewPath={onboarding?.storefrontUrl ? `${onboarding.storefrontUrl}/review` : null}
          paymentMethod={payments[0]?.method ?? "cash"}
          onClose={handleResetSale}
        />
      )}
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

function QtyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="h-7 w-7 rounded-full text-sm font-bold text-biz-ink hover:bg-biz-bg">
      {children}
    </button>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "pink" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-biz-muted">{label}</span>
      <span className={cn("font-semibold", tone === "pink" ? "text-biz-pink-500" : "text-biz-ink")}>{value}</span>
    </div>
  );
}

function InvoiceConfirmation({
  invoiceNumber, totals, items, clientName, clientPhone, reviewPath, paymentMethod, onClose,
}: {
  invoiceNumber: string;
  totals: ReturnType<typeof calculateTotals>;
  items: ReturnType<typeof usePosStore.getState>["items"];
  clientName: string;
  clientPhone: string | null;
  reviewPath: string | null;
  paymentMethod: string;
  onClose: () => void;
}) {
  const paidAt = new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const loyaltyEarned = Math.round(totals.grandTotal / 10);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="print-receipt w-full max-w-xl rounded-3xl bg-biz-surface shadow-2xl">
        {/* Screen-only header */}
        <div className="flex items-center justify-between border-b border-biz-border px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-biz-green-500 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M5 13l4 4L19 7"/></svg>
            </span>
            <p className="text-sm font-semibold text-biz-ink">Invoice saved &amp; payment recorded</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-biz-bg px-3 py-1.5 text-xs font-semibold text-biz-ink hover:bg-biz-border"
            >
              🖨 Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Receipt body — prints cleanly */}
        <div className="px-6 py-5 print:px-4 print:py-2">
          {/* Salon header */}
          <div className="mb-4 text-center">
            <p className="font-display text-xl font-bold lowercase text-biz-ink">clitell</p>
            <p className="mt-0.5 text-xs text-biz-muted">Tax Invoice</p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <p className="text-biz-muted-2">Invoice #</p>
              <p className="font-semibold text-biz-ink">{invoiceNumber}</p>
            </div>
            <div>
              <p className="text-biz-muted-2">Date</p>
              <p className="font-semibold text-biz-ink">{paidAt}</p>
            </div>
            <div>
              <p className="text-biz-muted-2">Client</p>
              <p className="font-semibold text-biz-ink">{clientName}</p>
            </div>
            <div>
              <p className="text-biz-muted-2">Payment</p>
              <p className="font-semibold capitalize text-biz-ink">{paymentMethod}</p>
            </div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-y border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                <th className="py-2 text-left font-semibold">Item</th>
                <th className="py-2 text-center font-semibold">Qty</th>
                <th className="py-2 text-right font-semibold">Rate</th>
                <th className="py-2 text-right font-semibold">GST%</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-biz-border/50">
              {items.map((it) => (
                <tr key={it.key}>
                  <td className="py-2 font-medium text-biz-ink">{it.name}</td>
                  <td className="py-2 text-center text-biz-muted">{it.quantity}</td>
                  <td className="py-2 text-right text-biz-muted">{formatINR(it.unitPrice)}</td>
                  <td className="py-2 text-right text-biz-muted">{it.taxRate}%</td>
                  <td className="py-2 text-right font-semibold text-biz-ink">{formatINR(it.unitPrice * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 space-y-1.5 rounded-2xl bg-biz-bg p-3 text-xs">
            <TaxRow label="Subtotal" value={formatINR(totals.subtotal)} />
            {totals.discountAmount > 0 && (
              <TaxRow label="Discount" value={`− ${formatINR(totals.discountAmount)}`} tone="pink" />
            )}
            <TaxRow label="CGST" value={formatINR(totals.cgst)} />
            <TaxRow label="SGST" value={formatINR(totals.sgst)} />
            {totals.tip > 0 && <TaxRow label="Tip" value={formatINR(totals.tip)} />}
            <div className="mt-2 flex items-center justify-between border-t border-biz-border pt-2 text-sm font-bold text-biz-ink">
              <span>Total paid</span>
              <span>{formatINR(totals.grandTotal)}</span>
            </div>
          </div>

          {loyaltyEarned > 0 && (
            <p className="mt-3 rounded-xl bg-biz-violet-50 px-3 py-2 text-center text-xs font-semibold text-biz-violet-700">
              +{loyaltyEarned} loyalty points earned 🎉
            </p>
          )}

          <p className="mt-4 text-center text-[10px] text-biz-muted-2">Thank you for visiting! · Powered by Clitell</p>
        </div>

        <div className="space-y-2 border-t border-biz-border px-6 py-4 print:hidden">
          {clientPhone && reviewPath && (() => {
            const reviewUrl = (typeof window !== "undefined" ? window.location.origin : "") + reviewPath;
            const msg = `Hi ${clientName}! 🙏 Thanks for visiting today. We'd love your feedback — it takes 20 seconds: ${reviewUrl}`;
            const wa = `https://wa.me/91${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
            return (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z"/></svg>
                Send review request on WhatsApp
              </a>
            );
          })()}
          {clientPhone && !reviewPath && (
            <p className="text-center text-[11px] text-biz-muted-2">Publish your storefront to enable review requests.</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-biz-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-biz-violet-600"
          >
            Done · Start new sale
          </button>
        </div>
      </div>
    </div>
  );
}

function TaxRow({ label, value, tone }: { label: string; value: string; tone?: "pink" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-biz-muted">{label}</span>
      <span className={cn("font-semibold", tone === "pink" ? "text-biz-pink-500" : "text-biz-ink")}>{value}</span>
    </div>
  );
}

function PosViewBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
        active ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink")}>
      {children}
    </button>
  );
}

// ─── Invoice History ──────────────────────────────────────────────────────────

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmt: number;
  paymentMethod: string;
  createdAt: string;
  client: { fullName: string; phone: string | null };
  lineItems: { label: string; qty: number; unitPrice: number }[];
}

function InvoiceHistory() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printId, setPrintId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page, statusFilter],
    queryFn: () => api.get<{ invoices: InvoiceSummary[] }>(
      `/invoices?page=${page}&limit=20${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`
    ),
  });

  const invoices = data?.invoices ?? [];

  const statusStyle: Record<string, string> = {
    paid:    "bg-biz-green-400/15 text-biz-green-500",
    issued:  "bg-biz-orange-300/25 text-biz-orange-600",
    void:    "bg-biz-bg text-biz-muted",
  };
  const methodLabel: Record<string, string> = { cash: "Cash", upi: "UPI", card: "Card", wallet: "Wallet", complimentary: "Comp." };

  return (
    <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-biz-ink">Invoice history</p>
        <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
          {["all", "paid", "issued"].map((s) => (
            <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn("rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-colors",
                statusFilter === s ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink")}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-biz-violet-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && invoices.length === 0 && (
        <div className="flex h-32 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm text-biz-muted">No invoices found.</p>
        </div>
      )}

      {!isLoading && invoices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                <th className="px-3 py-2 font-semibold">Invoice</th>
                <th className="px-3 py-2 font-semibold">Client</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Method</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <>
                  <tr key={inv.id}
                    onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                    className="cursor-pointer border-b border-biz-border transition-colors hover:bg-biz-bg">
                    <td className="px-3 py-3">
                      <p className="font-mono text-xs font-semibold text-biz-ink">{inv.invoiceNumber}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-biz-ink">{inv.client.fullName}</p>
                      <p className="text-[11px] text-biz-muted-2">{inv.client.phone ?? ""}</p>
                    </td>
                    <td className="px-3 py-3 text-biz-muted">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3 capitalize text-biz-muted">
                      {methodLabel[inv.paymentMethod] ?? inv.paymentMethod}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusStyle[inv.status] ?? "bg-biz-bg text-biz-muted")}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-biz-ink">
                      ₹{inv.totalAmt.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  {expandedId === inv.id && (
                    <tr key={`${inv.id}-detail`} className="border-b border-biz-border bg-biz-bg">
                      <td colSpan={6} className="px-6 py-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Line items</p>
                        <ul className="space-y-1">
                          {inv.lineItems.map((li, i) => (
                            <li key={i} className="flex items-center justify-between text-xs text-biz-ink">
                              <span>{li.qty > 1 ? `${li.qty}× ` : ""}{li.label}</span>
                              <span className="font-semibold">₹{(li.qty * li.unitPrice).toLocaleString("en-IN")}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPrintId(inv.id); }}
                          className="mt-3 rounded-full bg-biz-surface px-3 py-1.5 text-xs font-semibold text-biz-ink hover:bg-biz-border"
                        >
                          🖨 Print bill
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
          className="rounded-full bg-biz-bg px-4 py-1.5 text-xs font-semibold text-biz-muted disabled:opacity-40 hover:bg-biz-border">
          ← Previous
        </button>
        <span className="text-xs text-biz-muted-2">Page {page}</span>
        <button type="button" disabled={invoices.length < 20} onClick={() => setPage((p) => p + 1)}
          className="rounded-full bg-biz-bg px-4 py-1.5 text-xs font-semibold text-biz-muted disabled:opacity-40 hover:bg-biz-border">
          Next →
        </button>
      </div>

      {printId && <PastInvoiceReceipt invoiceId={printId} onClose={() => setPrintId(null)} />}
    </section>
  );
}

// ─── Printable past invoice ────────────────────────────────────────────────────

interface FullInvoice {
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt: string | null;
  subtotal: number;
  discountAmt: number;
  cgstAmt: number;
  sgstAmt: number;
  tipAmt: number;
  totalAmt: number;
  notes: string | null;
  client: { fullName: string; phone: string | null };
  lineItems: { label: string; qty: number; unitPrice: number; taxPct: number; lineTotal: number }[];
  business: { name: string; legalName: string; phone: string; email: string; gstin: string; address: string; city: string };
}

function PastInvoiceReceipt({ invoiceId, onClose }: { invoiceId: string; onClose: () => void }) {
  const { data: inv, isLoading, isError } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => api.get<FullInvoice>(`/invoices/${invoiceId}`),
  });

  const dateLabel = inv
    ? new Date(inv.paidAt ?? inv.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
  const b = inv?.business;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="print-receipt w-full max-w-xl rounded-3xl bg-biz-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-biz-border px-6 py-4 print:hidden">
          <p className="text-sm font-semibold text-biz-ink">Bill · {inv?.invoiceNumber ?? "…"}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={!inv} onClick={() => window.print()}
              className="rounded-full bg-biz-bg px-3 py-1.5 text-xs font-semibold text-biz-ink hover:bg-biz-border disabled:opacity-40">
              🖨 Print
            </button>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
          </div>
        </div>

        {isLoading && <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-biz-violet-500 border-t-transparent" /></div>}
        {isError && <p className="px-6 py-10 text-center text-sm text-biz-pink-500">Could not load this invoice.</p>}

        {inv && b && (
          <div className="px-6 py-5 print:px-4 print:py-2">
            {/* Business header */}
            <div className="mb-4 text-center">
              <p className="font-display text-xl font-bold text-biz-ink">{b.name || "Tax Invoice"}</p>
              {b.address && <p className="mt-0.5 text-[11px] text-biz-muted">{[b.address, b.city].filter(Boolean).join(", ")}</p>}
              <p className="text-[11px] text-biz-muted">
                {[b.phone, b.gstin ? `GSTIN: ${b.gstin}` : ""].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-xs font-semibold text-biz-muted-2">TAX INVOICE</p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><p className="text-biz-muted-2">Invoice #</p><p className="font-semibold text-biz-ink">{inv.invoiceNumber}</p></div>
              <div><p className="text-biz-muted-2">Date</p><p className="font-semibold text-biz-ink">{dateLabel}</p></div>
              <div><p className="text-biz-muted-2">Client</p><p className="font-semibold text-biz-ink">{inv.client.fullName}{inv.client.phone ? ` · ${inv.client.phone}` : ""}</p></div>
              <div><p className="text-biz-muted-2">Payment</p><p className="font-semibold capitalize text-biz-ink">{inv.paymentMethod} · {inv.status}</p></div>
            </div>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-y border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                  <th className="py-2 text-left font-semibold">Item</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Rate</th>
                  <th className="py-2 text-right font-semibold">GST%</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-biz-border/50">
                {inv.lineItems.map((li, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-biz-ink">{li.label}</td>
                    <td className="py-2 text-center text-biz-muted">{li.qty}</td>
                    <td className="py-2 text-right text-biz-muted">{formatINR(li.unitPrice)}</td>
                    <td className="py-2 text-right text-biz-muted">{li.taxPct}%</td>
                    <td className="py-2 text-right font-semibold text-biz-ink">{formatINR(li.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 space-y-1.5 rounded-2xl bg-biz-bg p-3 text-xs print:bg-transparent print:px-0">
              <TaxRow label="Subtotal" value={formatINR(inv.subtotal)} />
              {inv.discountAmt > 0 && <TaxRow label="Discount" value={`− ${formatINR(inv.discountAmt)}`} tone="pink" />}
              <TaxRow label="CGST" value={formatINR(inv.cgstAmt)} />
              <TaxRow label="SGST" value={formatINR(inv.sgstAmt)} />
              {inv.tipAmt > 0 && <TaxRow label="Tip" value={formatINR(inv.tipAmt)} />}
              <div className="mt-2 flex items-center justify-between border-t border-biz-border pt-2 text-sm font-bold text-biz-ink">
                <span>Total</span>
                <span>{formatINR(inv.totalAmt)}</span>
              </div>
            </div>

            {inv.notes && <p className="mt-3 text-[11px] text-biz-muted">Note: {inv.notes}</p>}
            <p className="mt-4 text-center text-[10px] text-biz-muted-2">Thank you for visiting! · Powered by Clitell</p>
          </div>
        )}
      </div>
    </div>
  );
}
