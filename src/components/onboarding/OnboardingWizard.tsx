"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "profile" | "services" | "hours" | "publish";

type ServiceRow = {
  id?: string;
  name: string;
  categoryName: string;
  durationMinutes: number;
  price: number;
  description: string;
};

type HoursRow = {
  day: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

const DEFAULT_HOURS: HoursRow[] = [
  { day: "mon", label: "Monday",    open: "10:00", close: "20:00", closed: false },
  { day: "tue", label: "Tuesday",   open: "10:00", close: "20:00", closed: false },
  { day: "wed", label: "Wednesday", open: "10:00", close: "20:00", closed: false },
  { day: "thu", label: "Thursday",  open: "10:00", close: "20:00", closed: false },
  { day: "fri", label: "Friday",    open: "10:00", close: "21:00", closed: false },
  { day: "sat", label: "Saturday",  open: "09:00", close: "21:00", closed: false },
  { day: "sun", label: "Sunday",    open: "10:00", close: "18:00", closed: false },
];

const DEFAULT_SERVICES: ServiceRow[] = [
  { name: "Haircut + Blowdry", categoryName: "Hair", durationMinutes: 60, price: 799, description: "" },
  { name: "Hair Colour (Global)", categoryName: "Hair", durationMinutes: 120, price: 2499, description: "" },
  { name: "Cleanup (Basic)", categoryName: "Skin", durationMinutes: 45, price: 599, description: "" },
];

const STEPS: Step[] = ["profile", "services", "hours", "publish"];
const STEP_LABELS = ["Your Business", "Services", "Hours", "Go Live"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("glamify_token");
}

function getUser(): { fullName?: string; tenantId?: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("glamify_user") ?? "null"); } catch { return null; }
}

async function apiPost(path: string, body: unknown) {
  const token = getToken();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  return data?.data;
}

// ─── Progress stepper ────────────────────────────────────────────────────────

function Stepper({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${i > 0 ? "ml-0" : ""}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done ? "bg-brand-500 text-white" : active ? "bg-ink text-white" : "bg-border-strong text-muted"
              }`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (i + 1)}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-ink" : done ? "text-brand-600" : "text-muted"}`}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 sm:mx-3 h-px w-6 sm:w-12 transition-colors ${done ? "bg-brand-500" : "bg-border-strong"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Business profile ────────────────────────────────────────────────

function StepProfile({ onNext }: { onNext: (area: string, tagline: string, description: string, phone: string, address: string) => void }) {
  const user = getUser();
  const [area, setArea] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleNext() {
    if (!area.trim()) { setError("Area / locality is required"); return; }
    setSaving(true); setError(null);
    try {
      await apiPost("/api/v1/onboarding/storefront", { area, tagline, description, phone, address });
      onNext(area, tagline, description, phone, address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">Tell us about your business</h2>
        <p className="text-sm text-muted">This shows on your public storefront page.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Area / locality *" hint="e.g. Bandra West, Koregaon Park">
          <input value={area} onChange={e => setArea(e.target.value)} placeholder="Bandra West" className={inputCls} />
        </Field>
        <Field label="Business phone">
          <div className="flex rounded-2xl border border-border-strong bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30">
            <span className="flex items-center px-3 text-sm text-muted border-r border-border-strong bg-surface-2 shrink-0">+91</span>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" className="flex-1 bg-transparent px-3 py-3 text-sm text-ink focus:outline-none" />
          </div>
        </Field>
      </div>

      <Field label="Address">
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Shop 4, Linking Road, Mumbai 400050" className={inputCls} />
      </Field>

      <Field label="Tagline" hint="One line about your salon (max 160 chars)">
        <input value={tagline} onChange={e => setTagline(e.target.value.slice(0, 160))} placeholder="Your neighbourhood beauty destination" className={inputCls} />
        <p className="text-right text-xs text-muted-2 mt-1">{tagline.length}/160</p>
      </Field>

      <Field label="About your business" hint="2–4 sentences. Shown on the About section of your storefront.">
        <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 600))} rows={3} placeholder="We've been serving the neighbourhood for 10 years…" className={inputCls + " resize-none"} />
        <p className="text-right text-xs text-muted-2 mt-1">{description.length}/600</p>
      </Field>

      {error && <p className="text-sm text-brand-600 font-medium">{error}</p>}

      <div className="flex justify-end pt-2">
        <button onClick={handleNext} disabled={saving} className={btnCls}>
          {saving ? "Saving…" : "Next: Add services →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Services ────────────────────────────────────────────────────────

const CATEGORIES = ["Hair", "Skin", "Makeup", "Nails", "Spa", "Beard", "Other"];

function StepServices({ onNext, onBack }: { onNext: (services: ServiceRow[]) => void; onBack: () => void }) {
  const [rows, setRows] = useState<ServiceRow[]>(DEFAULT_SERVICES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setRows(r => [...r, { name: "", categoryName: "Hair", durationMinutes: 60, price: 0, description: "" }]);
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i));
  }

  function update<K extends keyof ServiceRow>(i: number, key: K, val: ServiceRow[K]) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  }

  async function handleNext() {
    const valid = rows.filter(r => r.name.trim() && r.price >= 0);
    if (valid.length === 0) { setError("Add at least one service"); return; }
    setSaving(true); setError(null);
    try {
      await apiPost("/api/v1/onboarding/services", { services: valid });
      onNext(valid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save services");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">Add your services</h2>
        <p className="text-sm text-muted">Customers will book from this list. You can change it anytime.</p>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Service name">
                  <input value={row.name} onChange={e => update(i, "name", e.target.value)} placeholder="e.g. Haircut + Blowdry" className={inputCls} />
                </Field>
                <Field label="Category">
                  <select value={row.categoryName} onChange={e => update(i, "categoryName", e.target.value)} className={inputCls + " appearance-none"}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <button onClick={() => removeRow(i)} className="mt-6 h-9 w-9 flex items-center justify-center rounded-full border border-border-strong text-muted hover:border-brand-500 hover:text-brand-500 transition-colors" aria-label="Remove">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Price (₹)">
                <input type="number" min={0} value={row.price} onChange={e => update(i, "price", Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label="Duration (min)">
                <select value={row.durationMinutes} onChange={e => update(i, "durationMinutes", Number(e.target.value))} className={inputCls + " appearance-none"}>
                  {[15,30,45,60,75,90,120,150,180,240].map(d => <option key={d} value={d}>{d < 60 ? `${d} min` : d === 60 ? "1h" : `${Math.floor(d/60)}h${d%60?` ${d%60}m`:""}`}</option>)}
                </select>
              </Field>
              <Field label="Description (optional)" className="col-span-2 sm:col-span-1">
                <input value={row.description} onChange={e => update(i, "description", e.target.value.slice(0, 200))} placeholder="Short note…" className={inputCls} />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addRow} className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-300 text-brand-500 text-base font-bold">+</span>
        Add another service
      </button>

      {error && <p className="text-sm text-brand-600 font-medium">{error}</p>}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className={backBtnCls}>← Back</button>
        <button onClick={handleNext} disabled={saving} className={btnCls}>
          {saving ? "Saving…" : "Next: Set hours →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Hours ───────────────────────────────────────────────────────────

function StepHours({ onNext, onBack }: { onNext: (hours: HoursRow[]) => void; onBack: () => void }) {
  const [hours, setHours] = useState<HoursRow[]>(DEFAULT_HOURS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, key: keyof HoursRow, val: string | boolean) {
    setHours(h => h.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  }

  function copyToAll(i: number) {
    const src = hours[i];
    setHours(h => h.map(row => ({ ...row, open: src.open, close: src.close })));
  }

  async function handleNext() {
    setSaving(true); setError(null);
    try {
      // Convert array to keyed object { mon: { open, close, closed }, … }
      const hoursMap = Object.fromEntries(
        hours.map(r => [r.day, { open: r.open, close: r.close, closed: r.closed }])
      );
      await apiPost("/api/v1/onboarding/storefront/hours", { hours: hoursMap });
      onNext(hours);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save hours");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">Opening hours</h2>
        <p className="text-sm text-muted">Customers see this on your storefront. You can update anytime.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
        {hours.map((row, i) => (
          <div key={row.day} className={`flex items-center gap-3 px-4 py-3 ${row.closed ? "bg-surface-2" : ""}`}>
            <div className="w-24 shrink-0">
              <span className={`text-sm font-medium ${row.closed ? "text-muted-2" : "text-ink"}`}>{row.label}</span>
            </div>
            <label className="flex items-center gap-1.5 shrink-0">
              <input type="checkbox" checked={!row.closed} onChange={e => update(i, "closed", !e.target.checked)} className="accent-brand-500 h-4 w-4 rounded" />
              <span className="text-xs text-muted">Open</span>
            </label>
            {!row.closed ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={row.open} onChange={e => update(i, "open", e.target.value)} className="text-sm border border-border-strong rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                  <span className="text-muted text-xs">to</span>
                  <input type="time" value={row.close} onChange={e => update(i, "close", e.target.value)} className="text-sm border border-border-strong rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                </div>
                <button onClick={() => copyToAll(i)} className="text-xs text-muted hover:text-brand-600 shrink-0 hidden sm:block">Copy to all</button>
              </>
            ) : (
              <span className="text-xs text-muted-2 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-brand-600 font-medium">{error}</p>}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className={backBtnCls}>← Back</button>
        <button onClick={handleNext} disabled={saving} className={btnCls}>
          {saving ? "Saving…" : "Next: Publish →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Publish ─────────────────────────────────────────────────────────

function StepPublish({
  onPublish,
  onBack,
  storefrontUrl,
}: {
  onPublish: () => void;
  onBack: () => void;
  storefrontUrl: string | null;
}) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(storefrontUrl);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handlePublish() {
    setPublishing(true); setError(null);
    try {
      const data = await apiPost("/api/v1/onboarding/storefront/publish", {});
      setLiveUrl(data.storefrontUrl);
      setPublished(true);
      onPublish();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}${liveUrl}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (published && liveUrl) {
    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : "https://glamify.in"}${liveUrl}`;
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M7 18l8 8 14-14" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-ink mb-2">You&apos;re live! 🎉</h2>
          <p className="text-muted">Your storefront is published and ready to take bookings.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Your storefront URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-ink break-all">{fullUrl}</code>
            <button onClick={copyLink} className="shrink-0 rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl bg-surface-2 border border-border p-5 text-left space-y-2 text-sm text-muted">
          <p className="font-semibold text-ink">Share it now:</p>
          <p>📱 Add to your Instagram bio</p>
          <p>💬 Send on WhatsApp to existing customers</p>
          <p>🪧 Print on your visiting card / shop board</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={btnCls}>View my storefront →</a>
          <button onClick={() => router.push("/dashboard")} className={backBtnCls}>Go to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">Ready to go live?</h2>
        <p className="text-sm text-muted">Customers will be able to find and book your salon the moment you publish.</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: "🌐", title: "Branded storefront page", body: "Your own link at glamify.in — shareable, bookable, always up to date." },
          { icon: "📲", title: "OTP-verified bookings", body: "Customers book with their phone number. You get confirmed, real appointments." },
          { icon: "🎁", title: "₹50 cashback for new customers", body: "Glamify seeds your first bookings — customers get cashback on their first online booking." },
          { icon: "📈", title: "Google-ready SEO page", body: "Your storefront is structured for local search. Connect GBP later to get the Website button on Google." },
        ].map(item => (
          <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-white px-5 py-4">
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div>
              <p className="font-semibold text-ink text-sm">{item.title}</p>
              <p className="text-xs text-muted mt-0.5">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-brand-600 font-medium">{error}</p>}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className={backBtnCls}>← Back</button>
        <button onClick={handlePublish} disabled={publishing} className={btnCls + " px-10"}>
          {publishing ? "Publishing…" : "Publish my storefront 🚀"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-2xl border border-border-strong bg-white px-4 py-3 text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-ink transition-colors";
const btnCls = "inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:pointer-events-none";
const backBtnCls = "inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-3 text-sm font-medium text-ink hover:border-ink transition-colors";

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-2">{hint}</p>}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);

  // Redirect to login if no token
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  const user = getUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-white px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-display font-extrabold text-lg text-ink tracking-tight">Glamify</a>
        <span className="text-sm text-muted">
          Welcome, <span className="font-semibold text-ink">{user?.fullName?.split(" ")[0] ?? "there"}</span>
        </span>
      </div>

      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <div className="mb-6">
          <p className="eyebrow mb-3">Setup wizard</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[-0.02em] text-ink leading-tight">
            Set up your storefront
          </h1>
          <p className="mt-2 text-sm text-muted">Takes about 5 minutes. You can edit everything later.</p>
        </div>

        <Stepper current={step} />

        {step === "profile" && (
          <StepProfile
            onNext={(area, tagline, description, phone, address) => {
              void area; void tagline; void description; void phone; void address;
              setStep("services");
            }}
          />
        )}

        {step === "services" && (
          <StepServices
            onNext={(services) => { void services; setStep("hours"); }}
            onBack={() => setStep("profile")}
          />
        )}

        {step === "hours" && (
          <StepHours
            onNext={(hours) => { void hours; setStep("publish"); }}
            onBack={() => setStep("services")}
          />
        )}

        {step === "publish" && (
          <StepPublish
            onPublish={() => {}}
            onBack={() => setStep("hours")}
            storefrontUrl={storefrontUrl}
          />
        )}
      </div>
    </div>
  );
}
