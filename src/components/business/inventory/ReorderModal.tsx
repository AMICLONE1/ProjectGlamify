"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { findInventoryItem, suppliers } from "@/lib/inventory-seed";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { useInventoryStore } from "./inventoryStore";

const reorderSchema = z.object({
  quantity: z
    .number({ error: "Quantity is required" })
    .int("Use whole units")
    .positive("Must be > 0"),
  supplierId: z.enum(["sup-01", "sup-02", "sup-03", "sup-04"]),
  expectedDate: z.string().min(1, "Pick an expected delivery date"),
  notes: z.string().max(500).optional(),
});

type ReorderInput = z.infer<typeof reorderSchema>;

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ReorderModal() {
  const reorderItemId = useInventoryStore((s) => s.reorderItemId);
  const closeReorder = useInventoryStore((s) => s.closeReorder);
  const [submitted, setSubmitted] = useState<{ poNumber: string; total: number } | null>(null);

  const item = findInventoryItem(reorderItemId ?? "");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReorderInput>({
    resolver: zodResolver(reorderSchema),
    defaultValues: {
      quantity: item?.reorderQuantity ?? 1,
      supplierId: item?.supplierId ?? "sup-01",
      expectedDate: todayPlus(3),
      notes: "",
    },
  });

  useEffect(() => {
    if (!item) return;
    reset({
      quantity: item.reorderQuantity,
      supplierId: item.supplierId,
      expectedDate: todayPlus(suppliers.find((s) => s.id === item.supplierId)?.leadTimeDays ?? 3),
      notes: "",
    });
    setSubmitted(null);
  }, [item, reset]);

  if (!reorderItemId || !item) return null;

  const qty = Number(watch("quantity")) || 0;
  const total = qty * item.costPrice;

  function onSubmit(values: ReorderInput) {
    if (!item) return;
    const poNumber = `PO-2026-${Math.floor(Math.random() * 900 + 100)}`;
    console.log(`[po:created]`, { poNumber, itemId: item.id, ...values });
    setSubmitted({ poNumber, total: values.quantity * item.costPrice });
  }

  function handleClose() {
    setSubmitted(null);
    closeReorder();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-biz-surface shadow-2xl">
        <div className="border-b border-biz-border p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-biz-violet-600">
                {submitted ? "PO created" : "Raise purchase order"}
              </p>
              <h2 className="mt-1 truncate font-display text-xl font-bold text-biz-ink">{item.name}</h2>
              <p className="text-xs text-biz-muted-2">
                {item.sku} · {item.brand} · Cost {formatINR(item.costPrice)} per {item.unit}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-biz-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-biz-muted hover:bg-biz-border"
            >
              Close
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-biz-green-400/20 text-2xl font-bold text-biz-green-500">
              ✓
            </div>
            <p className="font-display text-xl font-bold text-biz-ink">{submitted.poNumber} sent</p>
            <p className="text-sm text-biz-muted">
              {item.name} has been ordered. Total: {formatINR(submitted.total)}.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mx-auto rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-biz-violet-600"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5" noValidate>
            <Field label="Quantity" error={errors.quantity?.message}>
              <input
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                className={inputCls(!!errors.quantity)}
              />
            </Field>

            <Field label="Supplier" error={errors.supplierId?.message}>
              <select {...register("supplierId")} className={inputCls(!!errors.supplierId)}>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · lead {s.leadTimeDays} days
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Expected delivery date" error={errors.expectedDate?.message}>
              <input
                type="date"
                min={todayPlus(0)}
                {...register("expectedDate")}
                className={inputCls(!!errors.expectedDate)}
              />
            </Field>

            <Field label="Notes (optional)" error={errors.notes?.message}>
              <textarea
                rows={3}
                placeholder="e.g. Urgent — color appointments scheduled this weekend"
                {...register("notes")}
                className={inputCls(!!errors.notes, true)}
              />
            </Field>

            <div className="rounded-2xl bg-biz-bg p-3 text-xs">
              <div className="flex justify-between text-biz-muted">
                <span>Unit cost</span>
                <span>{formatINR(item.costPrice)}</span>
              </div>
              <div className="flex justify-between text-biz-muted">
                <span>Quantity</span>
                <span>× {qty}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-biz-border pt-2 text-sm font-bold text-biz-ink">
                <span>PO total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-full bg-biz-bg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-biz-violet-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-biz-violet-600 disabled:opacity-50"
              >
                {isSubmitting ? "Sending…" : "Send PO"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-xs">
      <span className="block text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</span>
      {children}
      {error && <span className="block text-[11px] text-biz-pink-500">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean, textarea = false): string {
  return cn(
    "w-full rounded-2xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2",
    textarea && "resize-y min-h-[80px]",
    hasError ? "ring-2 ring-biz-pink-500/40" : "focus:ring-biz-violet-300"
  );
}
