"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/cn";

type Tab = "business" | "tax" | "branches" | "roles" | "integrations";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "business", label: "Business profile", hint: "Identity, logo, hours" },
  { id: "tax", label: "Tax & GST", hint: "GSTIN, HSN, invoice format" },
  { id: "branches", label: "Branches", hint: "Multi-location setup" },
  { id: "roles", label: "Roles & permissions", hint: "Owner, manager, staff" },
  { id: "integrations", label: "Integrations", hint: "Razorpay, FCM, OpenAI" },
];

export function SettingsBoard() {
  const [tab, setTab] = useState<Tab>("business");

  return (
    <div className="space-y-4">
      <header className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <p className="text-xs font-medium text-biz-violet-600">Settings</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
          Business configuration
        </h1>
        <p className="mt-1.5 text-sm text-biz-muted">
          Owner-level settings. Changes ripple to invoices, the consumer app, and staff permissions.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <nav className="rounded-3xl bg-biz-surface p-3 shadow-sm">
          <ul className="space-y-1">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "w-full rounded-2xl px-4 py-3 text-left transition-colors",
                    tab === t.id
                      ? "bg-biz-violet-50 text-biz-violet-700"
                      : "text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
                  )}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-[11px]",
                      tab === t.id ? "text-biz-violet-600" : "text-biz-muted-2"
                    )}
                  >
                    {t.hint}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rounded-3xl bg-biz-surface p-5 shadow-sm sm:p-6">
          {tab === "business" && <BusinessForm />}
          {tab === "tax" && <TaxForm />}
          {tab === "branches" && <BranchesPanel />}
          {tab === "roles" && <RolesPanel />}
          {tab === "integrations" && <IntegrationsPanel />}
        </div>
      </div>
    </div>
  );
}

// ─── Business profile ─────────────────────────────────────────

const businessSchema = z.object({
  name: z.string().min(2, "Required"),
  legalName: z.string().min(2, "Required"),
  contact: z.string().min(8, "Required"),
  email: z.email("Enter a valid email"),
  openHour: z.number().min(0).max(23),
  closeHour: z.number().min(1).max(24),
  about: z.string().max(500).optional(),
});
type BusinessInput = z.infer<typeof businessSchema>;

function BusinessForm() {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "Glamify · Bandra",
      legalName: "Glamify Technologies Pvt Ltd",
      contact: "+91 22 4001 9090",
      email: "bandra@glamify.in",
      openHour: 9,
      closeHour: 20,
      about:
        "Bandra flagship · 8 stylists · serves haircare, color, facials, manicures, and bridal packages.",
    },
  });

  function onSubmit(values: BusinessInput) {
    console.log("[settings:business:saved]", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <SectionTitle eyebrow="Identity" title="Tell clients who you are" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name" error={errors.name?.message}>
          <input {...register("name")} className={inputCls(!!errors.name)} />
        </Field>
        <Field label="Legal entity" error={errors.legalName?.message}>
          <input {...register("legalName")} className={inputCls(!!errors.legalName)} />
        </Field>
        <Field label="Contact phone" error={errors.contact?.message}>
          <input {...register("contact")} className={inputCls(!!errors.contact)} />
        </Field>
        <Field label="Contact email" error={errors.email?.message}>
          <input type="email" {...register("email")} className={inputCls(!!errors.email)} />
        </Field>
        <Field label="Open hour (24h)" error={errors.openHour?.message}>
          <input
            type="number"
            min={0}
            max={23}
            {...register("openHour", { valueAsNumber: true })}
            className={inputCls(!!errors.openHour)}
          />
        </Field>
        <Field label="Close hour (24h)" error={errors.closeHour?.message}>
          <input
            type="number"
            min={1}
            max={24}
            {...register("closeHour", { valueAsNumber: true })}
            className={inputCls(!!errors.closeHour)}
          />
        </Field>
      </div>
      <Field label="About" error={errors.about?.message}>
        <textarea rows={3} {...register("about")} className={inputCls(!!errors.about, true)} />
      </Field>

      <FooterActions saved={saved} isSubmitting={isSubmitting} />
    </form>
  );
}

// ─── Tax / GST ────────────────────────────────────────────────

const taxSchema = z.object({
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN"),
  hsnHair: z.string().min(2),
  hsnRetail: z.string().min(2),
  defaultGstPercent: z.number().min(0).max(28),
  invoicePrefix: z.string().min(2).max(8),
  showInclusive: z.boolean(),
});
type TaxInput = z.infer<typeof taxSchema>;

function TaxForm() {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaxInput>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      gstin: "27ABCDE1234F1Z5",
      hsnHair: "999721",
      hsnRetail: "33049000",
      defaultGstPercent: 18,
      invoicePrefix: "GLM",
      showInclusive: false,
    },
  });

  function onSubmit(values: TaxInput) {
    console.log("[settings:tax:saved]", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <SectionTitle eyebrow="Tax" title="GST-compliant invoicing" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="GSTIN" error={errors.gstin?.message}>
          <input
            {...register("gstin")}
            className={inputCls(!!errors.gstin)}
            placeholder="27ABCDE1234F1Z5"
          />
        </Field>
        <Field label="Default GST %" error={errors.defaultGstPercent?.message}>
          <input
            type="number"
            min={0}
            max={28}
            {...register("defaultGstPercent", { valueAsNumber: true })}
            className={inputCls(!!errors.defaultGstPercent)}
          />
        </Field>
        <Field label="HSN · Services" error={errors.hsnHair?.message}>
          <input {...register("hsnHair")} className={inputCls(!!errors.hsnHair)} placeholder="999721" />
        </Field>
        <Field label="HSN · Retail products" error={errors.hsnRetail?.message}>
          <input
            {...register("hsnRetail")}
            className={inputCls(!!errors.hsnRetail)}
            placeholder="33049000"
          />
        </Field>
        <Field label="Invoice prefix" error={errors.invoicePrefix?.message}>
          <input
            {...register("invoicePrefix")}
            className={inputCls(!!errors.invoicePrefix)}
            placeholder="GLM"
          />
        </Field>
        <Field label="" error="">
          <label className="mt-6 inline-flex items-center gap-2 text-sm text-biz-ink">
            <input
              type="checkbox"
              {...register("showInclusive")}
              className="h-4 w-4 accent-biz-violet-500"
            />
            Show prices inclusive of GST on consumer app
          </label>
        </Field>
      </div>

      <FooterActions saved={saved} isSubmitting={isSubmitting} />
    </form>
  );
}

// ─── Branches ─────────────────────────────────────────────────

const branchesSeed = [
  { id: "br-bandra", name: "Bandra · Hill Road", address: "21A Hill Road, Mumbai 400050", staff: 8, status: "live" as const },
  { id: "br-juhu", name: "Juhu · Linking Road", address: "Sahay Mansion, Juhu, Mumbai 400049", staff: 5, status: "live" as const },
  { id: "br-pune", name: "Pune · Koregaon Park", address: "Lane 7, KP, Pune 411001", staff: 3, status: "setup" as const },
];

function BranchesPanel() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle eyebrow="Branches" title="Run every branch from one workspace" />
        <button className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600">
          Add branch
        </button>
      </div>

      <ul className="space-y-3">
        {branchesSeed.map((br) => (
          <li key={br.id} className="rounded-2xl bg-biz-bg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-biz-ink">{br.name}</p>
                <p className="text-xs text-biz-muted-2">{br.address}</p>
                <p className="mt-1 text-xs text-biz-muted">{br.staff} staff</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  br.status === "live"
                    ? "bg-biz-green-400/15 text-biz-green-500"
                    : "bg-biz-orange-300/25 text-biz-orange-600"
                )}
              >
                {br.status === "live" ? "Live" : "Setup pending"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Roles & permissions ──────────────────────────────────────

const ROLES = [
  { id: "owner", label: "Owner", access: "Full access" },
  { id: "manager", label: "Manager", access: "All except billing exports" },
  { id: "receptionist", label: "Receptionist", access: "Bookings, POS, clients" },
  { id: "stylist", label: "Stylist", access: "Own schedule + client notes" },
  { id: "marketing", label: "Marketing", access: "Campaigns + reports" },
];

const PERMISSIONS = [
  "Bookings · view",
  "Bookings · edit",
  "Clients · view",
  "Clients · edit",
  "POS · checkout",
  "Inventory · receive",
  "Campaigns · send",
  "Reports · view",
  "Reports · export",
  "Settings · edit",
];

const ROLE_MATRIX: Record<string, boolean[]> = {
  owner: PERMISSIONS.map(() => true),
  manager: [true, true, true, true, true, true, true, true, false, false],
  receptionist: [true, true, true, true, true, false, false, false, false, false],
  stylist: [true, false, true, false, false, false, false, false, false, false],
  marketing: [true, false, true, false, false, false, true, true, true, false],
};

function RolesPanel() {
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Roles" title="Who can do what" />

      <div className="overflow-x-auto rounded-2xl bg-biz-bg">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
              <th className="px-3 py-3 text-left font-semibold">Permission</th>
              {ROLES.map((r) => (
                <th key={r.id} className="px-3 py-3 text-center font-semibold">{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p, idx) => (
              <tr key={p} className="border-b border-biz-border last:border-0">
                <td className="px-3 py-3 text-biz-ink">{p}</td>
                {ROLES.map((r) => (
                  <td key={r.id} className="px-3 py-3 text-center">
                    {ROLE_MATRIX[r.id][idx] ? (
                      <span className="text-biz-green-500">✓</span>
                    ) : (
                      <span className="text-biz-muted-2">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-biz-muted-2">
        Granular per-permission editing coming with the real backend (Phase C).
      </p>
    </div>
  );
}

// ─── Integrations ─────────────────────────────────────────────

const INTEGRATIONS = [
  { id: "razorpay", label: "Razorpay", purpose: "UPI payments + refunds", connected: true },
  { id: "fcm", label: "Firebase Cloud Messaging", purpose: "Push to staff + consumer apps", connected: true },
  { id: "openai", label: "OpenAI", purpose: "AI insights, copy, no-show", connected: true },
  { id: "supabase", label: "Supabase", purpose: "Database · Auth · Realtime", connected: true },
  { id: "resend", label: "Resend", purpose: "Transactional email", connected: false },
  { id: "twilio", label: "Twilio WhatsApp", purpose: "WhatsApp Business API", connected: false },
] as const;

function IntegrationsPanel() {
  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Integrations" title="External services wired in" />

      <ul className="grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((it) => (
          <li key={it.id} className="rounded-2xl bg-biz-bg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-biz-ink">{it.label}</p>
                <p className="mt-0.5 text-xs text-biz-muted-2">{it.purpose}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  it.connected
                    ? "bg-biz-green-400/15 text-biz-green-500"
                    : "bg-biz-surface text-biz-muted"
                )}
              >
                {it.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            <button
              type="button"
              className="mt-3 rounded-full bg-biz-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border"
            >
              {it.connected ? "Manage" : "Connect"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-biz-violet-600">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-bold text-biz-ink">{title}</h2>
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
      {label && (
        <span className="block text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</span>
      )}
      {children}
      {error && <span className="block text-[11px] text-biz-pink-500">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean, textarea = false): string {
  return cn(
    "w-full rounded-2xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2",
    textarea && "resize-y min-h-[90px]",
    hasError ? "ring-2 ring-biz-pink-500/40" : "focus:ring-biz-violet-300"
  );
}

function FooterActions({ saved, isSubmitting }: { saved: boolean; isSubmitting: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-biz-border pt-4">
      <p className="text-xs text-biz-muted-2">
        {saved
          ? "✓ Saved — wired to Supabase in Phase C."
          : "Changes are local until the backend goes live."}
      </p>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-biz-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
