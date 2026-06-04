"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminTenant, type ProvisionResult } from "@/lib/admin-api";

const PLANS = ["trial", "starter", "growth", "professional", "enterprise"];
const BUSINESS_TYPES = ["salon", "spa", "clinic", "barbershop", "tattoo", "other"];
const PLAN_PRICES: Record<string, string> = {
  trial: "Free (14-day trial)",
  starter: "₹1,999/mo",
  growth: "₹3,999/mo",
  professional: "₹6,999/mo",
  enterprise: "Custom",
};

export default function AdminTenantsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [provisioned, setProvisioned] = useState<ProvisionResult | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tenants", q],
    queryFn: () => adminApi.tenants(q),
  });

  const mutate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { suspended?: boolean; plan?: string } }) =>
      adminApi.setTenant(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-tenants"] }),
  });

  const tenants = data?.tenants ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Businesses</h1>
          <p className="text-sm text-zinc-400">
            {tenants.length} {tenants.length === 1 ? "business" : "businesses"}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, slug, email…"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none sm:w-64"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="whitespace-nowrap rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            + Create business
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : tenants.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
          No businesses found.
        </p>
      ) : (
        <div className="space-y-2.5">
          {tenants.map((t) => (
            <TenantRow
              key={t.id}
              t={t}
              busy={mutate.isPending}
              onChange={(body) => mutate.mutate({ id: t.id, body })}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBusinessModal
          onClose={() => setShowCreate(false)}
          onCreated={(result) => {
            setShowCreate(false);
            setProvisioned(result);
            qc.invalidateQueries({ queryKey: ["admin-tenants"] });
          }}
        />
      )}

      {provisioned && (
        <CredentialsModal
          result={provisioned}
          onClose={() => setProvisioned(null)}
        />
      )}
    </div>
  );
}

function TenantRow({
  t, onChange, busy,
}: {
  t: AdminTenant;
  onChange: (b: { suspended?: boolean; plan?: string }) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{t.name}</p>
            {t.suspended && (
              <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                Suspended
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            /{t.slug} · {t.businessType} · {t.email ?? "no email"}
          </p>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {t.counts.users} users · {t.counts.clients} clients · {t.counts.locations} locations ·{" "}
            joined{" "}
            {new Date(t.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={t.plan}
            disabled={busy}
            onChange={(e) => onChange({ plan: e.target.value })}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs capitalize text-zinc-200 focus:outline-none"
          >
            {PLANS.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <button
            disabled={busy}
            onClick={() => onChange({ suspended: !t.suspended })}
            className={
              t.suspended
                ? "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                : "rounded-lg border border-red-900 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 disabled:opacity-50"
            }
          >
            {t.suspended ? "Activate" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateBusinessModal({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated: (r: ProvisionResult) => void;
}) {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "",
    businessName: "", businessType: "salon", city: "", plan: "trial",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
    let pwd = "";
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm((f) => ({ ...f, password: pwd }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await adminApi.provision(form);
      onCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="font-semibold">Create business account</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {/* Plan selection */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Plan
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, plan: p }))}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    form.plan === p
                      ? "border-zinc-300 bg-zinc-800"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <p className="text-xs font-semibold capitalize text-zinc-200">{p}</p>
                  <p className="text-[10px] text-zinc-500">{PLAN_PRICES[p]}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner name" value={form.fullName} onChange={set("fullName")} placeholder="Priya Sharma" required />
            <Field label="Phone" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" required />
          </div>
          <Field label="Email (login)" value={form.email} onChange={set("email")} type="email" placeholder="owner@salon.com" required />

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.password}
                onChange={set("password")}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Business name" value={form.businessName} onChange={set("businessName")} placeholder="Studio Glow" required />
            <Field label="City" value={form.city} onChange={set("city")} placeholder="Mumbai" required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Business type</label>
            <select
              value={form.businessType}
              onChange={set("businessType")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm capitalize text-zinc-100 focus:border-zinc-500 focus:outline-none"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-xl bg-red-950/50 px-3 py-2 text-xs text-red-300">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-40"
            >
              {loading ? "Creating…" : "Create & get credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CredentialsModal({ result, onClose }: { result: ProvisionResult; onClose: () => void }) {
  const copied = useRef<Record<string, boolean>>({});
  const [, rerender] = useState(0);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      copied.current[key] = true;
      rerender((n) => n + 1);
      setTimeout(() => { copied.current[key] = false; rerender((n) => n + 1); }, 2000);
    });
  }

  const loginUrl = result.loginUrl || "https://clitell.vercel.app/login";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <h2 className="font-semibold">Business created</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>

        <div className="space-y-3 p-6">
          <p className="text-xs text-zinc-400">
            Share these credentials with the client. Save them now — the password won't be shown again.
          </p>

          <CopyRow label="Login URL" value={loginUrl} onCopy={() => copy(loginUrl, "url")} copied={!!copied.current["url"]} />
          <CopyRow label="Email" value={result.email} onCopy={() => copy(result.email, "email")} copied={!!copied.current["email"]} />
          <CopyRow label="Password" value={result.password} onCopy={() => copy(result.password, "pwd")} copied={!!copied.current["pwd"]} mono />
          <CopyRow
            label="Plan"
            value={`${result.plan} — ${PLAN_PRICES[result.plan] ?? ""}`}
            onCopy={() => copy(result.plan, "plan")}
            copied={!!copied.current["plan"]}
          />

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">WhatsApp / email message template</p>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{`Hi ${result.email.split("@")[0]}, welcome to Clitell! 🎉

Here are your login details:
🔗 ${loginUrl}
📧 ${result.email}
🔑 ${result.password}

Please change your password after first login. Let me know if you need help setting up!`}</p>
            <button
              onClick={() => copy(
                `Hi ${result.email.split("@")[0]}, welcome to Clitell! 🎉\n\nHere are your login details:\n🔗 ${loginUrl}\n📧 ${result.email}\n🔑 ${result.password}\n\nPlease change your password after first login. Let me know if you need help setting up!`,
                "msg"
              )}
              className="mt-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
            >
              {copied.current["msg"] ? "Copied!" : "Copy message"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label, value, onCopy, copied, mono,
}: {
  label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500">{label}</p>
        <p className={`truncate text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
      >
        {copied ? "✓" : "Copy"}
      </button>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
      />
    </div>
  );
}
