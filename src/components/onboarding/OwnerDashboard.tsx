"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StorefrontManager } from "@/components/dashboard/StorefrontManager";

// ─── Types ────────────────────────────────────────────────────────────────────

type StorefrontSummary = { id: string; slug: string; city: string; area: string; isPublished: boolean } | null;

type Booking = {
  id: string; customerName: string; customerPhone: string;
  scheduledAt: string; status: string; totalAmount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("glamify_token");
}

function getUser(): { fullName?: string; tenantId?: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("glamify_user") ?? "null"); } catch { return null; }
}

async function apiFetch(path: string) {
  const t = getToken();
  const res = await fetch(path, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? "Request failed");
  return data?.data;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed:   "bg-emerald-50 text-emerald-700",
  pending_otp: "bg-amber-50 text-amber-700",
  visited:     "bg-brand-50 text-brand-700",
  cancelled:   "bg-surface-2 text-muted",
  no_show:     "bg-red-50 text-red-700",
};

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavSection = "home" | "storefront" | "bookings";

const NAV: { id: NavSection; label: string; icon: string }[] = [
  { id: "home",       label: "Home",       icon: "🏠" },
  { id: "storefront", label: "Storefront", icon: "🌐" },
  { id: "bookings",   label: "Bookings",   icon: "📅" },
];

// ─── Home section ─────────────────────────────────────────────────────────────

function SectionHome({
  user, storefront, bookings, onGoToStorefront
}: {
  user: ReturnType<typeof getUser>;
  storefront: StorefrontSummary;
  bookings: Booking[];
  onGoToStorefront: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const fullUrl = storefront
    ? `${typeof window !== "undefined" ? window.location.origin : "https://glamify.in"}/${storefront.city}/${storefront.slug}`
    : null;

  function copyLink() {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const todayBookings = bookings.filter(b => new Date(b.scheduledAt).toDateString() === new Date().toDateString());
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const revenue = bookings.filter(b => b.status === "visited").reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Dashboard</p>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[-0.02em] text-ink">
          Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Storefront status card */}
      {!storefront || !storefront.isPublished ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white text-xl">🌐</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink">Your storefront isn&apos;t live yet</p>
              <p className="text-sm text-muted mt-0.5">Publish your storefront to start taking online bookings.</p>
              <button onClick={() => router.push("/onboarding")} className="mt-3 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                Complete setup →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Live</span>
              </div>
              <p className="font-bold text-ink text-sm">Your storefront is live</p>
              <a href={`/${storefront.city}/${storefront.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline font-mono mt-0.5 block truncate">
                {fullUrl}
              </a>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={copyLink} className="rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={onGoToStorefront} className="rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                Manage →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today",     value: todayBookings.length.toString(), icon: "📅" },
          { label: "Confirmed", value: confirmedCount.toString(),        icon: "✅" },
          { label: "Revenue",   value: revenue > 0 ? `₹${revenue.toLocaleString("en-IN")}` : "₹0", icon: "💰" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-white p-4 text-center">
            <div className="text-xl mb-1">{kpi.icon}</div>
            <div className="text-xl font-extrabold text-ink">{kpi.value}</div>
            <div className="text-[11px] text-muted mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="eyebrow mb-3">Quick actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "✂️",  label: "Services",  action: onGoToStorefront },
            { icon: "📸",  label: "Photos",    action: onGoToStorefront },
            { icon: "⭐",  label: "Reviews",   action: onGoToStorefront },
            { icon: "🔗",  label: "Share link", action: copyLink },
          ].map(a => (
            <button key={a.label} onClick={a.action} className="rounded-2xl border border-border bg-white p-4 text-center hover:border-brand-300 transition-colors">
              <div className="text-2xl mb-1.5">{a.icon}</div>
              <p className="text-xs font-semibold text-ink">{a.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <p className="eyebrow mb-3">Recent bookings</p>
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted">
            No bookings yet.
            {storefront?.isPublished && <p className="text-xs text-muted-2 mt-1">Share your storefront link to get your first booking!</p>}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
            {bookings.slice(0, 8).map(b => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3.5 gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{b.customerName}</p>
                  <p className="text-xs text-muted">
                    {new Date(b.scheduledAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-sm text-ink">₹{b.totalAmount.toLocaleString("en-IN")}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[b.status] ?? "bg-surface-2 text-muted"}`}>
                    {b.status.replace("_"," ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp share */}
      {storefront?.isPublished && fullUrl && (
        <div className="rounded-2xl bg-ink p-5 text-white">
          <p className="font-bold mb-0.5">Share your storefront</p>
          <p className="text-white/60 text-sm mb-4">Send to customers on WhatsApp, add to Instagram bio.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Book your appointment at ${fullUrl}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors">
              📱 Share on WhatsApp
            </a>
            <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors">
              🔗 {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bookings section ─────────────────────────────────────────────────────────

function SectionBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow mb-2">Bookings</p>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">All bookings</h2>
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-muted">No bookings yet.</div>
      ) : (
        <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
          {bookings.map(b => (
            <div key={b.id} className="flex items-center justify-between px-4 py-4 gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink text-sm">{b.customerName}</p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(b.scheduledAt).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-sm text-ink">₹{b.totalAmount.toLocaleString("en-IN")}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[b.status] ?? "bg-surface-2 text-muted"}`}>
                  {b.status.replace("_"," ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function OwnerDashboard() {
  const router = useRouter();
  const user = getUser();
  const [section, setSection] = useState<NavSection>("home");
  const [storefront, setStorefront] = useState<StorefrontSummary>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    Promise.all([
      apiFetch("/api/v1/onboarding/storefront").catch(() => null),
      apiFetch("/api/v1/booking/recent").catch(() => ({ bookings: [] })),
    ]).then(([sfData, bookData]) => {
      setStorefront(sfData?.storefront ?? null);
      setBookings(bookData?.bookings ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.removeItem("glamify_token");
    localStorage.removeItem("glamify_user");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm px-4 py-3.5 flex items-center justify-between">
        <a href="/" className="font-display font-extrabold text-lg text-ink tracking-tight">Glamify</a>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">{user?.fullName?.split(" ")[0]}</span>
          <button onClick={logout} className="text-xs text-muted hover:text-ink border border-border-strong rounded-full px-3 py-1.5 transition-colors">Sign out</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {section === "home"       && <SectionHome user={user} storefront={storefront} bookings={bookings} onGoToStorefront={() => setSection("storefront")} />}
            {section === "storefront" && <StorefrontManager />}
            {section === "bookings"   && <SectionBookings bookings={bookings} />}
          </>
        )}
      </div>

      {/* Bottom nav — mobile */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-sm safe-area-pb">
        <div className="flex">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-colors ${
                section === n.id ? "text-brand-600" : "text-muted hover:text-ink"
              }`}
            >
              <span className="text-xl leading-none">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
