"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, locationsApi, staffApi, onboardingApi, type BranchLocation, type StaffMember } from "@/lib/api-client";
import { getUser } from "@/lib/session";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";

type Tab = "business" | "tax" | "branches" | "roles" | "integrations";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "business", label: "Business profile", hint: "Identity, contact, hours" },
  { id: "tax", label: "Tax & GST", hint: "GSTIN, HSN, invoice format" },
  { id: "branches", label: "Branches", hint: "Locations & staff" },
  { id: "roles", label: "Team & roles", hint: "Who has access" },
  { id: "integrations", label: "Integrations", hint: "Connected services" },
];

export function SettingsBoard() {
  const [tab, setTab] = useState<Tab>("business");

  return (
    <div className="space-y-4">
      <header className="rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <p className="text-xs font-medium text-biz-violet-600">Settings</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">Business configuration</h1>
        <p className="mt-1.5 text-sm text-biz-muted">
          Owner-level settings. Changes apply to your storefront, invoices, and team.
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
                    tab === t.id ? "bg-biz-violet-50 text-biz-violet-700" : "text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
                  )}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className={cn("mt-0.5 text-[11px]", tab === t.id ? "text-biz-violet-600" : "text-biz-muted-2")}>{t.hint}</p>
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

// ─── Business profile (real) ──────────────────────────────────────────────────

function BusinessForm() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get() });

  const [form, setForm] = useState<null | {
    name: string; legalName: string; phone: string; email: string;
    about: string; openHour: string; closeHour: string; revenueGoal: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Initialise the form once data loads (no hardcoded defaults — empty if unset).
  const f = form ?? (data ? {
    name: data.profile.name,
    legalName: data.profile.legalName,
    phone: data.profile.phone,
    email: data.profile.email,
    about: data.profile.about,
    openHour: data.profile.openHour != null ? String(data.profile.openHour) : "",
    closeHour: data.profile.closeHour != null ? String(data.profile.closeHour) : "",
    revenueGoal: data.profile.revenueGoal != null ? String(data.profile.revenueGoal) : "",
  } : null);

  const save = useMutation({
    mutationFn: () => {
      if (!f) throw new Error("Not loaded");
      return settingsApi.update({
        name: f.name.trim(),
        legalName: f.legalName.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        about: f.about.trim(),
        openHour: Number(f.openHour),
        closeHour: Number(f.closeHour),
        revenueGoal: f.revenueGoal.trim() === "" ? 0 : Number(f.revenueGoal),
      });
    },
    onSuccess: () => {
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  function set<K extends keyof NonNullable<typeof f>>(key: K, val: string) {
    setForm({ ...(f as NonNullable<typeof f>), [key]: val });
  }

  function validateAndSave() {
    setError(null);
    if (!f) return;
    if (f.name.trim().length < 2) return setError("Display name is required.");
    if (f.phone.trim().length < 8) return setError("A valid contact phone is required.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("A valid contact email is required.");
    if (!f.about.trim()) return setError("Tell clients a bit about your business.");
    const oh = Number(f.openHour), ch = Number(f.closeHour);
    if (!(oh >= 0 && oh <= 23)) return setError("Open hour must be 0–23.");
    if (!(ch >= 1 && ch <= 24)) return setError("Close hour must be 1–24.");
    if (ch <= oh) return setError("Close hour must be after open hour.");
    save.mutate();
  }

  if (isLoading || !f) return <PanelSkeleton />;

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Identity" title="Tell clients who you are" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name *"><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Studio Clitell" className={inputCls} /></Field>
        <Field label="Legal entity"><input value={f.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="e.g. Clitell Technologies Pvt Ltd" className={inputCls} /></Field>
        <Field label="Contact phone *"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} /></Field>
        <Field label="Contact email *"><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@yourbusiness.com" className={inputCls} /></Field>
        <Field label="Open hour (24h) *"><input type="number" min={0} max={23} value={f.openHour} onChange={(e) => set("openHour", e.target.value)} placeholder="9" className={inputCls} /></Field>
        <Field label="Close hour (24h) *"><input type="number" min={1} max={24} value={f.closeHour} onChange={(e) => set("closeHour", e.target.value)} placeholder="20" className={inputCls} /></Field>
      </div>
      <Field label="About *"><textarea rows={3} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="Describe your salon, specialities, and what makes you stand out…" className={cn(inputCls, "resize-y min-h-[90px]")} /></Field>

      <Field label="Monthly revenue goal (₹)">
        <input
          type="number" min={0} value={f.revenueGoal}
          onChange={(e) => set("revenueGoal", e.target.value)}
          placeholder="e.g. 150000"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-biz-muted-2">Shown on your dashboard&apos;s Revenue Goal card. Leave blank to hide the target.</p>
      </Field>

      {error && <p className="text-sm text-biz-pink-500">{error}</p>}
      <SaveBar saved={saved} pending={save.isPending} onSave={validateAndSave} />
    </div>
  );
}

// ─── Tax / GST (real) ─────────────────────────────────────────────────────────

function TaxForm() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get() });

  const [form, setForm] = useState<null | {
    gstEnabled: boolean; gstin: string; hsnServices: string; hsnRetail: string; defaultGstPct: string; invoicePrefix: string; showInclusive: boolean;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const f = form ?? (data ? {
    gstEnabled: data.tax.gstEnabled,
    gstin: data.tax.gstin,
    hsnServices: data.tax.hsnServices,
    hsnRetail: data.tax.hsnRetail,
    defaultGstPct: data.tax.defaultGstPct != null ? String(data.tax.defaultGstPct) : "",
    invoicePrefix: data.tax.invoicePrefix,
    showInclusive: data.tax.showInclusive,
  } : null);

  const save = useMutation({
    mutationFn: () => {
      if (!f) throw new Error("Not loaded");
      return settingsApi.update({
        gstin: f.gstEnabled ? f.gstin.trim().toUpperCase() : "",
        tax: {
          gstEnabled: f.gstEnabled,
          hsnServices: f.hsnServices.trim(),
          hsnRetail: f.hsnRetail.trim(),
          defaultGstPct: f.defaultGstPct ? Number(f.defaultGstPct) : undefined,
          invoicePrefix: f.invoicePrefix.trim().toUpperCase(),
          showInclusive: f.showInclusive,
        },
      });
    },
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); queryClient.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e) => setError(e instanceof Error ? e.message : "Save failed"),
  });

  function set<K extends keyof NonNullable<typeof f>>(key: K, val: string | boolean) {
    setForm({ ...(f as NonNullable<typeof f>), [key]: val });
  }

  function validateAndSave() {
    setError(null);
    if (!f) return;
    if (f.gstEnabled) {
      if (f.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/.test(f.gstin.trim().toUpperCase())) {
        return setError("Enter a valid 15-character GSTIN, or leave it blank.");
      }
      if (f.defaultGstPct && !(Number(f.defaultGstPct) >= 0 && Number(f.defaultGstPct) <= 28)) {
        return setError("Default GST % must be between 0 and 28.");
      }
    }
    save.mutate();
  }

  if (isLoading || !f) return <PanelSkeleton />;

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Tax" title="GST &amp; invoicing" />

      {/* Master toggle: GST-registered vs simple billing */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-biz-border bg-biz-bg p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-biz-ink">Charge GST on bills</p>
          <p className="mt-0.5 text-xs text-biz-muted">
            {f.gstEnabled
              ? "Invoices show CGST + SGST and are labelled “Tax Invoice”."
              : "Simple billing — no tax added. Bills are labelled “Invoice”. Turn this on once your salon is GST-registered."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={f.gstEnabled}
          onClick={() => set("gstEnabled", !f.gstEnabled)}
          className={cn(
            "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            f.gstEnabled ? "bg-biz-violet-500" : "bg-biz-border"
          )}
        >
          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", f.gstEnabled ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      </div>

      {f.gstEnabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GSTIN"><input value={f.gstin} onChange={(e) => set("gstin", e.target.value)} placeholder="27ABCDE1234F1Z5" className={inputCls} /></Field>
          <Field label="Default GST %"><input type="number" min={0} max={28} value={f.defaultGstPct} onChange={(e) => set("defaultGstPct", e.target.value)} placeholder="18" className={inputCls} /></Field>
          <Field label="HSN · Services"><input value={f.hsnServices} onChange={(e) => set("hsnServices", e.target.value)} placeholder="999721" className={inputCls} /></Field>
          <Field label="HSN · Retail products"><input value={f.hsnRetail} onChange={(e) => set("hsnRetail", e.target.value)} placeholder="33049000" className={inputCls} /></Field>
          <Field label="Invoice prefix"><input value={f.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} placeholder="GLM" className={inputCls} /></Field>
          <Field label="">
            <label className="mt-6 inline-flex items-center gap-2 text-sm text-biz-ink">
              <input type="checkbox" checked={f.showInclusive} onChange={(e) => set("showInclusive", e.target.checked)} className="h-4 w-4 accent-biz-violet-500" />
              Show prices inclusive of GST on the storefront
            </label>
          </Field>
        </div>
      )}

      {!f.gstEnabled && (
        <Field label="Invoice prefix"><input value={f.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} placeholder="GLM" className={cn(inputCls, "max-w-xs")} /></Field>
      )}

      {error && <p className="text-sm text-biz-pink-500">{error}</p>}
      <SaveBar saved={saved} pending={save.isPending} onSave={validateAndSave} />
    </div>
  );
}

// ─── Branches (real locations) ────────────────────────────────────────────────

function BranchesPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["locations"], queryFn: () => locationsApi.list() });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => locationsApi.create(form),
    onSuccess: () => { setAdding(false); setForm({ name: "", address: "", city: "", phone: "" }); queryClient.invalidateQueries({ queryKey: ["locations"] }); },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not add branch"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => locationsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });

  const branches: BranchLocation[] = data?.locations ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle eyebrow="Branches" title="Run every branch from one workspace" />
        {!adding && (
          <button onClick={() => setAdding(true)} className="rounded-full bg-biz-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600">
            Add branch
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border border-biz-border bg-biz-bg p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Branch name *"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bandra · Hill Road" className={inputCls} /></Field>
            <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className={inputCls} /></Field>
            <Field label="Address"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="21A Hill Road" className={inputCls} /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 22 4001 9090" className={inputCls} /></Field>
          </div>
          {error && <p className="mt-2 text-xs text-biz-pink-500">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setError(null); if (!form.name.trim()) { setError("Branch name is required"); return; } create.mutate(); }} disabled={create.isPending} className="rounded-full bg-biz-violet-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50">
              {create.isPending ? "Adding…" : "Add branch"}
            </button>
            <button onClick={() => { setAdding(false); setError(null); }} className="rounded-full bg-biz-surface px-4 py-1.5 text-xs font-semibold text-biz-ink hover:bg-biz-border">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <PanelSkeleton />
      ) : branches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">No branches yet.</p>
      ) : (
        <ul className="space-y-3">
          {branches.map((br) => (
            <li key={br.id} className="rounded-2xl bg-biz-bg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-biz-ink">{br.name}</p>
                  <p className="text-xs text-biz-muted-2">{[br.address, br.city].filter(Boolean).join(", ") || "No address set"}</p>
                  <p className="mt-1 text-xs text-biz-muted">{br.staffCount} staff</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider", br.isActive ? "bg-biz-green-400/15 text-biz-green-500" : "bg-biz-orange-300/25 text-biz-orange-600")}>
                    {br.isActive ? "Active" : "Inactive"}
                  </span>
                  {branches.length > 1 && (
                    <button onClick={() => remove.mutate(br.id)} className="rounded-full border border-biz-border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-biz-muted hover:border-biz-pink-300 hover:text-biz-pink-500">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Team & roles (real users) ────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = { owner: "Owner", manager: "Manager", staff: "Staff", receptionist: "Receptionist" };
const ROLE_ACCESS: Record<string, string> = {
  owner: "Full access to everything",
  manager: "Everything except billing exports & settings",
  receptionist: "Bookings, POS, and clients",
  staff: "Own schedule and client notes",
};

function RolesPanel() {
  const { data, isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => staffApi.list() });
  const me = getUser();
  const team: StaffMember[] = data?.staff ?? [];

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Team" title="Who has access" />

      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <ul className="space-y-3">
          {/* Owner (current user) always shown */}
          {me && !team.some((t) => t.id === me.id) && (
            <RoleRow name={me.fullName} email={me.email} role="owner" you />
          )}
          {team.map((m) => (
            <RoleRow key={m.id} name={m.fullName} email={m.email} role={m.role} you={m.id === me?.id} />
          ))}
          {team.length === 0 && !me && (
            <p className="rounded-2xl border border-dashed border-biz-border p-6 text-center text-sm text-biz-muted">No team members yet.</p>
          )}
        </ul>
      )}

      <p className="text-xs text-biz-muted-2">Add team members from the Staff page. Each role has a fixed access level shown above.</p>
    </div>
  );
}

function RoleRow({ name, email, role, you }: { name: string; email: string; role: string; you?: boolean }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-biz-bg p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-biz-violet-50 text-sm font-bold text-biz-violet-700">
          {name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "G"}
        </span>
        <div>
          <p className="font-semibold text-biz-ink">{name}{you && <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">You</span>}</p>
          <p className="text-xs text-biz-muted-2">{email}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="rounded-full bg-biz-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-biz-violet-700">{ROLE_LABEL[role] ?? role}</span>
        <p className="mt-1 text-[11px] text-biz-muted-2">{ROLE_ACCESS[role] ?? ""}</p>
      </div>
    </li>
  );
}

// ─── Integrations (real toggles) ──────────────────────────────────────────────

// Simple flag-based integrations (toggle = mark connected).
const INTEGRATIONS = [
  { id: "whatsapp", label: "WhatsApp Business", purpose: "Booking confirmations & reminders" },
  { id: "openai", label: "AI insights", purpose: "Smart suggestions & copy" },
];

function IntegrationsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get() });
  const { data: onboarding } = useQuery({ queryKey: ["onboarding-progress"], queryFn: () => onboardingApi.progress() });
  const connected = data?.integrations ?? {};
  const gbp = data?.gbp ?? null;
  const [gbpOpen, setGbpOpen] = useState(false);

  const toggle = useMutation({
    mutationFn: (next: Record<string, boolean>) => settingsApi.update({ integrations: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  if (isLoading) return <PanelSkeleton />;

  const bookingUrl = onboarding?.storefrontUrl
    ? (typeof window !== "undefined" ? window.location.origin : "") + onboarding.storefrontUrl
    : "";

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow="Integrations" title="Connect external services" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {/* Google Business Profile — real guided connect */}
        <li className="rounded-2xl bg-biz-bg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-biz-ink">Google Business Profile</p>
              <p className="mt-0.5 text-xs text-biz-muted-2">Add a “Book” button to your Google listing</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider", gbp ? "bg-biz-green-400/15 text-biz-green-500" : "bg-biz-surface text-biz-muted")}>
              {gbp ? "Connected" : "Not connected"}
            </span>
          </div>
          {gbp && (
            <a href={gbp.url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs text-biz-violet-600 hover:underline">
              {gbp.url}
            </a>
          )}
          <button
            type="button"
            onClick={() => setGbpOpen(true)}
            className="mt-3 rounded-full bg-biz-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border"
          >
            {gbp ? "Manage" : "Connect"}
          </button>
        </li>

        {/* Simple flag-based integrations */}
        {INTEGRATIONS.map((it) => {
          const on = !!connected[it.id];
          return (
            <li key={it.id} className="rounded-2xl bg-biz-bg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-biz-ink">{it.label}</p>
                  <p className="mt-0.5 text-xs text-biz-muted-2">{it.purpose}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider", on ? "bg-biz-green-400/15 text-biz-green-500" : "bg-biz-surface text-biz-muted")}>
                  {on ? "Connected" : "Not connected"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggle.mutate({ ...connected, [it.id]: !on })}
                disabled={toggle.isPending}
                className="mt-3 rounded-full bg-biz-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-biz-ink hover:bg-biz-border disabled:opacity-50"
              >
                {on ? "Disconnect" : "Connect"}
              </button>
            </li>
          );
        })}
      </ul>

      {gbpOpen && (
        <GbpConnectModal
          current={gbp?.url ?? ""}
          bookingUrl={bookingUrl}
          onClose={() => setGbpOpen(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["settings"] }); setGbpOpen(false); }}
        />
      )}
    </div>
  );
}

// Guided Google Business Profile connect: capture the listing link + show the
// salon how to point their Google "Book" button at their Clitell storefront.
function GbpConnectModal({ current, bookingUrl, onClose, onSaved }: {
  current: string; bookingUrl: string; onClose: () => void; onSaved: () => void;
}) {
  const [url, setUrl] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const save = useMutation({
    mutationFn: (gbpUrl: string | null) => settingsApi.update({ gbpUrl }),
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to save"),
  });

  function copyBooking() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-biz-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-biz-ink">Google Business Profile</h2>
            <p className="text-sm text-biz-muted">Let customers book you straight from Google.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>

        {/* Step 1 — paste listing */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-biz-muted-2">1 · Link your Google listing</p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your Google Maps / Business listing link"
            className="w-full rounded-xl border border-biz-border bg-white px-3 py-2.5 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
          />
          <p className="text-[11px] text-biz-muted-2">Search your salon on Google Maps → Share → Copy link.</p>
        </div>

        {/* Step 2 — booking link to paste into Google */}
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-biz-muted-2">2 · Add your booking link to Google</p>
          {bookingUrl ? (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-biz-bg px-3 py-2">
                <span className="truncate text-xs text-biz-ink">{bookingUrl}</span>
                <button onClick={copyBooking} className="ml-auto shrink-0 rounded-lg bg-biz-surface px-2.5 py-1 text-[11px] font-semibold text-biz-ink hover:bg-biz-border">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <ol className="list-decimal space-y-1 pl-4 text-[11px] text-biz-muted">
                <li>Open your Google Business Profile (search your salon name → “Edit profile”).</li>
                <li>Go to <strong>Bookings</strong> (or <strong>Edit profile → Booking</strong>).</li>
                <li>Paste the link above as your appointment / booking URL and save.</li>
                <li>A <strong>Book</strong> button now appears on your Google listing → customers land on your Clitell page.</li>
              </ol>
            </>
          ) : (
            <p className="rounded-xl bg-biz-orange-300/15 px-3 py-2 text-xs text-biz-orange-700">
              Publish your storefront first (Storefront tab) to get a booking link.
            </p>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-biz-pink-500">{error}</p>}

        <div className="mt-6 flex gap-2">
          {current && (
            <button
              onClick={() => save.mutate(null)}
              disabled={save.isPending}
              className="rounded-2xl border border-biz-border px-4 py-2.5 text-sm font-semibold text-biz-muted hover:bg-biz-bg disabled:opacity-50"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={() => { setError(null); save.mutate(url.trim() || null); }}
            disabled={save.isPending || (!url.trim() && !current)}
            className="flex-1 rounded-2xl bg-biz-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-40"
          >
            {save.isPending ? "Saving…" : current ? "Save changes" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-biz-violet-600">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-bold text-biz-ink">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-xs">
      {label && <span className="block text-[10px] uppercase tracking-wider text-biz-muted-2">{label}</span>}
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

function SaveBar({ saved, pending, onSave }: { saved: boolean; pending: boolean; onSave: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-biz-border pt-4">
      <p className="text-xs text-biz-muted-2">{saved ? "✓ Saved" : "Changes apply across your workspace."}</p>
      <button type="button" onClick={onSave} disabled={pending} className="rounded-full bg-biz-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-2xl" />)}
    </div>
  );
}
