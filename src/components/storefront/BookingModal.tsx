"use client";

import { useState, useEffect, useCallback } from "react";
import type { Storefront, Service, StaffMember } from "@/content/storefronts";
import { formatPrice, formatServicePrice, formatDuration } from "@/content/storefronts";

// ─── Types ──────────────────────────────────────────────────────────────────

type Step = "service" | "slot" | "details" | "otp" | "confirmed";

type TimeSlot = {
  time: string; // "10:00"
  staffId: string | null;
  staffName: string;
};

type BookingState = {
  selectedServiceIds: string[];
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: TimeSlot | null;
  customerName: string;
  customerPhone: string;
  bookingId: string | null;
  otp: string;
};

const EMPTY: BookingState = {
  selectedServiceIds: [],
  selectedDate: todayStr(),
  selectedSlot: null,
  customerName: "",
  customerPhone: "",
  bookingId: null,
  otp: "",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nextNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = todayStr();
  const tomorrow = nextNDays(2)[1];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Real API calls ──────────────────────────────────────────────────────────

// Fetch available slots from the real API; falls back to mock slots when no
// tenantId is available (seed-data storefronts viewed without a DB record).
async function fetchSlots(tenantId: string | undefined, date: string, staff: StaffMember[]): Promise<TimeSlot[]> {
  if (!tenantId) return generateFallbackSlots(date, staff);
  try {
    const res = await fetch(`/api/v1/booking/slots?tenantId=${tenantId}&date=${date}`);
    if (!res.ok) return generateFallbackSlots(date, staff);
    const data = await res.json();
    return (data.slots ?? []) as TimeSlot[];
  } catch {
    return generateFallbackSlots(date, staff);
  }
}

// Fallback slot generator used for seed-data storefronts (no DB)
function generateFallbackSlots(date: string, staff: StaffMember[]): TimeSlot[] {
  // Use a placeholder when team list is empty (seed storefronts)
  const effectiveStaff: StaffMember[] = staff.length > 0
    ? staff
    : [{ id: "any", name: "Any stylist", role: "staff" }];

  const slots: TimeSlot[] = [];
  for (let h = 10; h <= 19; h++) {
    for (const m of [0, 30]) {
      const seed = (h * 60 + m + (date.charCodeAt(8) || 0)) % 7;
      if (seed === 0) continue;
      const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      const member = effectiveStaff[seed % effectiveStaff.length];
      slots.push({ time, staffId: member.id, staffName: member.name });
    }
  }
  return slots;
}

// Create booking and trigger OTP send; falls back to mock when no tenantId
async function sendBookingOtp(
  tenantId: string | undefined,
  storefrontSlug: string,
  serviceIds: string[],
  staffId: string | null | undefined,
  date: string,
  time: string,
  customerName: string,
  customerPhone: string,
): Promise<string> {
  if (!tenantId) {
    // Seed-data fallback: simulate delay and return fake booking ID
    await new Promise((r) => setTimeout(r, 800));
    return "BKG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  const res = await fetch("/api/v1/booking/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId, storefrontSlug, serviceIds, staffDetailId: staffId, date, time, customerName, customerPhone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Failed to create booking");
  return data.bookingId as string;
}

// Verify OTP; falls back to accepting any 6-digit code for seed-data storefronts
async function verifyBookingOtp(tenantId: string | undefined, bookingId: string, otp: string): Promise<boolean> {
  if (!tenantId) {
    await new Promise((r) => setTimeout(r, 600));
    return otp.length === 6;
  }
  const res = await fetch("/api/v1/booking/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, otp }),
  });
  if (res.status === 200) return true;
  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? "OTP verification failed");
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepServiceSelect({
  services,
  categories,
  selected,
  onToggle,
  onNext,
}: {
  services: Storefront["services"];
  categories: Storefront["serviceCategories"];
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const filtered = services.filter((s) => s.categoryId === activeCategory);

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-base font-bold text-ink mb-4 shrink-0">Choose services</h3>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? "border-ink bg-ink text-white"
                : "border-border-strong bg-white text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Service list */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border -mx-1 px-1">
        {filtered.map((svc) => {
          const isSelected = selected.includes(svc.id);
          return (
            <button
              key={svc.id}
              onClick={() => onToggle(svc.id)}
              className={`w-full flex items-start justify-between gap-3 py-3.5 px-1 text-left transition-colors rounded-lg ${
                isSelected ? "bg-brand-50" : "hover:bg-surface-2"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${isSelected ? "text-brand-700" : "text-ink"}`}>
                  {svc.name}
                </p>
                <p className="text-xs text-muted mt-0.5">{formatDuration(svc.durationMins)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-ink whitespace-nowrap">{formatServicePrice(svc)}</span>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-border-strong bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Total + next */}
      {selected.length > 0 && (
        <div className="mt-4 shrink-0 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted">
              {selected.length} service{selected.length > 1 ? "s" : ""} selected
            </span>
            <span className="font-semibold text-ink">
              {formatPrice(
                services
                  .filter((s) => selected.includes(s.id))
                  .reduce((sum, s) => sum + s.price, 0)
              )}
            </span>
          </div>
          <button
            onClick={onNext}
            className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Choose date & time →
          </button>
        </div>
      )}
    </div>
  );
}

function StepSlotPicker({
  staff,
  tenantId,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotSelect,
  onNext,
  onBack,
}: {
  staff: Storefront["team"];
  tenantId?: string;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  onDateChange: (d: string) => void;
  onSlotSelect: (s: TimeSlot) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const dates = nextNDays(7);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  // Tick every 30 seconds to re-evaluate which slots are in the past
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      const mins = n.getHours() * 60 + n.getMinutes();
      setNowMinutes(mins);
      // If the selected slot has now become past, deselect it
      if (selectedSlot && selectedDate === todayStr()) {
        const [h, m] = selectedSlot.time.split(":").map(Number);
        if (h * 60 + m < mins + 30) {
          onSlotSelect(null as unknown as TimeSlot); // clear selection
        }
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [selectedSlot, selectedDate, onSlotSelect]);

  useEffect(() => {
    setLoadingSlots(true);
    fetchSlots(tenantId, selectedDate, staff)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [tenantId, selectedDate, staff]);

  const isToday = selectedDate === todayStr();
  // Add a 30-min buffer — don't allow booking slots within the next 30 minutes
  const cutoffMinutes = isToday ? nowMinutes + 30 : -1;

  function slotMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-base font-bold text-ink mb-3 shrink-0">Pick a date & time</h3>

      {/* Date row */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 shrink-0 scrollbar-hide">
        {dates.map((d) => {
          const isSelected = d === selectedDate;
          const dObj = new Date(d + "T00:00:00");
          return (
            <button
              key={d}
              onClick={() => onDateChange(d)}
              className={`shrink-0 flex flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                isSelected
                  ? "border-ink bg-ink text-white"
                  : "border-border-strong bg-white text-muted hover:border-ink hover:text-ink"
              }`}
            >
              <span className="text-[10px] uppercase tracking-wide">
                {dObj.toLocaleDateString("en-IN", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">
                {dObj.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots grid — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {loadingSlots && (
          <p className="py-6 text-center text-sm text-muted">Loading available slots…</p>
        )}
        <div className="grid grid-cols-3 gap-2 pb-2">
          {!loadingSlots && slots.map((slot) => {
            const isPast = slotMinutes(slot.time) < cutoffMinutes;
            const isSelected =
              selectedSlot?.time === slot.time &&
              selectedSlot?.staffId === slot.staffId;
            return (
              <button
                key={slot.time + slot.staffId}
                onClick={() => !isPast && onSlotSelect(slot)}
                disabled={isPast}
                className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  isPast
                    ? "border-border-strong bg-surface-2 text-muted-2 opacity-40 cursor-not-allowed line-through"
                    : isSelected
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-border-strong bg-white text-ink hover:border-brand-300"
                }`}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
        {!loadingSlots && slots.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            No slots available for this date. Try another day.
          </p>
        )}
      </div>

      <div className="mt-3 shrink-0 border-t border-border pt-3">
        {selectedSlot && (
          <p className="text-xs text-muted mb-3">
            {formatDateLabel(selectedDate)} · {selectedSlot.time} · with {selectedSlot.staffName}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-full border border-border-strong py-3 text-sm font-medium text-ink hover:border-ink transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!selectedSlot}
            className="flex-[2] rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

function StepCustomerDetails({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onSubmit,
  onBack,
  loading,
  error,
}: {
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-base font-bold text-ink mb-1">Your details</h3>
      <p className="text-sm text-muted mb-6">We&apos;ll send an OTP to confirm your booking.</p>

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold mb-2">
            Your name
          </label>
          <input
            type="text"
            placeholder="e.g. Ananya Sharma"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-2xl border border-border-strong bg-white px-4 py-3 text-base text-ink placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold mb-2">
            Mobile number
          </label>
          <div className="flex rounded-2xl border border-border-strong bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-ink transition-colors">
            <span className="flex items-center px-4 text-sm font-medium text-muted border-r border-border-strong bg-surface-2 shrink-0">
              +91
            </span>
            <input
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="flex-1 bg-transparent px-4 py-3 text-base text-ink placeholder:text-muted-2 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-brand-600 font-medium">{error}</p>
        )}

        <div className="mt-2 rounded-2xl bg-surface-2 px-4 py-3 text-xs text-muted leading-relaxed">
          An OTP will be sent to your mobile to confirm this booking. Your number is only used for appointment updates.
        </div>
      </div>

      <div className="mt-4 shrink-0 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border border-border-strong py-3 text-sm font-medium text-ink hover:border-ink transition-colors"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || name.trim().length < 2 || phone.length < 10}
          className="flex-[2] rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Sending OTP…" : "Send OTP →"}
        </button>
      </div>
    </div>
  );
}

function StepOTPVerify({
  phone,
  otp,
  bookingId,
  isSeedStorefront,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
  resendCountdown,
}: {
  phone: string;
  otp: string;
  bookingId: string | null;
  isSeedStorefront: boolean;
  onOtpChange: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
  resendCountdown: number;
}) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-base font-bold text-ink mb-1">Verify your number</h3>
      <p className="text-sm text-muted mb-6">
        Enter the 6-digit OTP sent to <span className="font-semibold text-ink">+91 {phone}</span>
      </p>

      <div className="flex flex-col gap-4 flex-1">
        {/* OTP input */}
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] text-muted font-semibold mb-2">
            OTP
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-2xl border border-border-strong bg-white px-4 py-3 text-2xl font-bold text-center tracking-[0.5em] text-ink placeholder:text-muted-2/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-ink"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-brand-600 font-medium">{error}</p>}

        {isSeedStorefront && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
            Demo mode: enter any 6-digit code to confirm.
          </div>
        )}

        <div className="text-center">
          {resendCountdown > 0 ? (
            <p className="text-sm text-muted">Resend OTP in {resendCountdown}s</p>
          ) : (
            <button onClick={onResend} className="text-sm font-semibold text-brand-600 hover:underline">
              Resend OTP
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 shrink-0 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border border-border-strong py-3 text-sm font-medium text-ink hover:border-ink transition-colors"
        >
          Back
        </button>
        <button
          onClick={onVerify}
          disabled={loading || otp.length < 6}
          className="flex-[2] rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Verifying…" : "Confirm booking →"}
        </button>
      </div>
    </div>
  );
}

function StepConfirmed({
  booking,
  salonName,
  onClose,
}: {
  booking: BookingState & { selectedServices: Service[] };
  salonName: string;
  onClose: () => void;
}) {
  const total = booking.selectedServices.reduce((s, svc) => s + svc.price, 0);

  return (
    <div className="flex flex-col items-center text-center h-full">
      {/* Success icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14l7 7 11-11" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="text-xl font-extrabold text-ink mb-1">Booking confirmed!</h3>
      <p className="text-sm text-muted mb-6">
        Your appointment at <strong>{salonName}</strong> is all set.
      </p>

      {/* Booking card */}
      <div className="w-full rounded-2xl border border-border bg-surface-2 p-5 text-left mb-6">
        <div className="text-xs uppercase tracking-[0.18em] text-muted mb-3 font-semibold">
          Booking details
        </div>
        <div className="space-y-2">
          {booking.selectedServices.map((svc) => (
            <div key={svc.id} className="flex justify-between text-sm">
              <span className="text-ink">{svc.name}</span>
              <span className="text-muted">{formatServicePrice(svc)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        {booking.selectedSlot && (
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted space-y-1">
            <p>📅 {formatDateLabel(booking.selectedDate)} · {booking.selectedSlot.time}</p>
            <p>👤 With {booking.selectedSlot.staffName}</p>
            <p className="font-semibold text-ink">Booking ID: {booking.bookingId}</p>
          </div>
        )}
      </div>

      <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 mb-6">
        A WhatsApp confirmation has been sent to +91 {booking.customerPhone}. You&apos;ll receive a check-in code on the morning of your appointment.
      </div>

      <button
        onClick={onClose}
        className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────

const STEPS: Step[] = ["service", "slot", "details", "otp", "confirmed"];
const STEP_LABELS = ["Services", "Date & Time", "Details", "Verify", "Done"];

function ProgressBar({ step }: { step: Step }) {
  const idx = STEPS.indexOf(step);
  if (step === "confirmed") return null;
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {STEPS.slice(0, -1).map((s, i) => (
        <div
          key={s}
          className={`flex-1 h-1 rounded-full transition-colors ${
            i <= idx ? "bg-brand-500" : "bg-border-strong"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

type Props = {
  storefront: Storefront;
  preselectedServiceId: string | null;
  onClose: () => void;
};

export function BookingModal({ storefront, preselectedServiceId, onClose }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [state, setState] = useState<BookingState>({
    ...EMPTY,
    selectedServiceIds: preselectedServiceId ? [preselectedServiceId] : [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Start countdown after OTP sent
  useEffect(() => {
    if (step !== "otp" || resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCountdown]);

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  async function handleSendOtp() {
    if (!state.customerName.trim() || state.customerPhone.length < 10) return;
    if (!state.selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const bookingId = await sendBookingOtp(
        storefront.tenantId,
        storefront.slug,
        state.selectedServiceIds,
        state.selectedSlot.staffId,
        state.selectedDate,
        state.selectedSlot.time,
        state.customerName.trim(),
        state.customerPhone,
      );
      update({ bookingId });
      setResendCountdown(30);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!state.bookingId || state.otp.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const success = await verifyBookingOtp(storefront.tenantId, state.bookingId, state.otp);
      if (success) {
        setStep("confirmed");
      } else {
        setError("Incorrect OTP. Please try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!state.selectedSlot) return;
    setLoading(true);
    try {
      const bookingId = await sendBookingOtp(
        storefront.tenantId,
        storefront.slug,
        state.selectedServiceIds,
        state.selectedSlot.staffId,
        state.selectedDate,
        state.selectedSlot.time,
        state.customerName.trim(),
        state.customerPhone,
      );
      update({ bookingId, otp: "" });
      setResendCountdown(30);
      setError(null);
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  const selectedServices = storefront.services.filter((s) =>
    state.selectedServiceIds.includes(s.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-border">
          <div>
            <p className="text-xs text-muted uppercase tracking-[0.15em] font-medium">
              {storefront.name}
            </p>
            <p className="text-sm font-semibold text-ink mt-0.5">
              {step === "confirmed" ? "All set!" : "Book an appointment"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-muted hover:border-ink hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-6 py-5">
          <ProgressBar step={step} />

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {step === "service" && (
              <StepServiceSelect
                services={storefront.services}
                categories={storefront.serviceCategories}
                selected={state.selectedServiceIds}
                onToggle={(id) =>
                  update({
                    selectedServiceIds: state.selectedServiceIds.includes(id)
                      ? state.selectedServiceIds.filter((s) => s !== id)
                      : [...state.selectedServiceIds, id],
                  })
                }
                onNext={() => setStep("slot")}
              />
            )}

            {step === "slot" && (
              <StepSlotPicker
                staff={storefront.team}
                tenantId={storefront.tenantId}
                selectedDate={state.selectedDate}
                selectedSlot={state.selectedSlot}
                onDateChange={(d) => update({ selectedDate: d, selectedSlot: null })}
                onSlotSelect={(s) => update({ selectedSlot: s })}
                onNext={() => setStep("details")}
                onBack={() => setStep("service")}
              />
            )}

            {step === "details" && (
              <StepCustomerDetails
                name={state.customerName}
                phone={state.customerPhone}
                onNameChange={(v) => update({ customerName: v })}
                onPhoneChange={(v) => update({ customerPhone: v })}
                onSubmit={handleSendOtp}
                onBack={() => setStep("slot")}
                loading={loading}
                error={error}
              />
            )}

            {step === "otp" && (
              <StepOTPVerify
                phone={state.customerPhone}
                otp={state.otp}
                bookingId={state.bookingId}
                isSeedStorefront={
                  !storefront.tenantId ||
                  state.bookingId?.startsWith("BKG-") ||
                  process.env.NEXT_PUBLIC_OTP_DEV_MODE === "true"
                }
                onOtpChange={(v) => update({ otp: v })}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={() => setStep("details")}
                loading={loading}
                error={error}
                resendCountdown={resendCountdown}
              />
            )}

            {step === "confirmed" && (
              <StepConfirmed
                booking={{ ...state, selectedServices }}
                salonName={storefront.name}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
