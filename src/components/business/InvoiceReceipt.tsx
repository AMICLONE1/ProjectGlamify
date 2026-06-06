"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

// Printable tax invoice for any past bill. Fetches the full invoice (with business
// header + GST split) and renders a clean receipt. Reused by POS history and the
// client profile. Print isolation is handled by the global `.print-receipt` CSS.

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

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

export function InvoiceReceipt({ invoiceId, onClose }: { invoiceId: string; onClose: () => void }) {
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
            <div className="mb-4 text-center">
              <p className="font-display text-xl font-bold text-biz-ink">{b.name || "Tax Invoice"}</p>
              {b.address && <p className="mt-0.5 text-[11px] text-biz-muted">{[b.address, b.city].filter(Boolean).join(", ")}</p>}
              <p className="text-[11px] text-biz-muted">{[b.phone, b.gstin ? `GSTIN: ${b.gstin}` : ""].filter(Boolean).join(" · ")}</p>
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
              <Row label="Subtotal" value={formatINR(inv.subtotal)} />
              {inv.discountAmt > 0 && <Row label="Discount" value={`− ${formatINR(inv.discountAmt)}`} tone="pink" />}
              <Row label="CGST" value={formatINR(inv.cgstAmt)} />
              <Row label="SGST" value={formatINR(inv.sgstAmt)} />
              {inv.tipAmt > 0 && <Row label="Tip" value={formatINR(inv.tipAmt)} />}
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

function Row({ label, value, tone }: { label: string; value: string; tone?: "pink" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-biz-muted">{label}</span>
      <span className={cn("font-semibold", tone === "pink" ? "text-biz-pink-500" : "text-biz-ink")}>{value}</span>
    </div>
  );
}
