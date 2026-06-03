"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type BookingData = {
  id: string;
  customerName: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  serviceIds: string[];
  durationMins: number;
  confirmedAt: string | null;
  staffDetail: { user: { fullName: string } } | null;
  storefront: {
    slug: string;
    city: string;
    area: string;
    tenant: { name: string; phone: string | null };
  };
};

const STATUS_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  confirmed:    { label: "Confirmed",    icon: "✓", color: "text-green-600 bg-green-50 border-green-200" },
  pending_otp:  { label: "Awaiting OTP", icon: "⏳", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  visited:      { label: "Completed",   icon: "★", color: "text-violet-600 bg-violet-50 border-violet-200" },
  cancelled:    { label: "Cancelled",   icon: "✕", color: "text-red-500 bg-red-50 border-red-200" },
  no_show:      { label: "No-show",     icon: "!", color: "text-orange-600 bg-orange-50 border-orange-200" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/booking/status?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setBooking(d.booking);
      })
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <p className="text-4xl">🔍</p>
        <h1 className="font-bold text-gray-900">Booking not found</h1>
        <p className="text-sm text-gray-500">{error ?? "This booking link may have expired or is invalid."}</p>
      </div>
    );
  }

  const { date, time } = formatDateTime(booking.scheduledAt);
  const status = STATUS_DISPLAY[booking.status] ?? { label: booking.status, icon: "•", color: "text-gray-600 bg-gray-50 border-gray-200" };
  const salonName = booking.storefront.tenant.name;
  const areaLabel = booking.storefront.area.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const cityLabel = booking.storefront.city[0].toUpperCase() + booking.storefront.city.slice(1);
  const storefrontHref = `/${booking.storefront.city}/${booking.storefront.slug}`;

  // Build Google Calendar link
  const start = new Date(booking.scheduledAt);
  const end = new Date(start.getTime() + booking.durationMins * 60_000);
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Appointment at ${salonName}`)}&dates=${start.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z/${end.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z&details=${encodeURIComponent(`Booking ID: ${booking.id.slice(-8).toUpperCase()}`)}&location=${encodeURIComponent(`${salonName}, ${areaLabel}, ${cityLabel}`)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clitell header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-400">
        Powered by{" "}
        <a href="/" className="font-semibold text-violet-600 hover:underline">Clitell</a>
        {" "}· OTP-verified bookings
      </div>

      <div className="mx-auto max-w-md px-4 py-10">
        {/* Status badge */}
        <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${status.color}`}>
          <span className="text-xl font-bold">{status.icon}</span>
          <div>
            <p className="font-semibold">{status.label}</p>
            {booking.confirmedAt && (
              <p className="text-xs opacity-70">
                Confirmed {new Date(booking.confirmedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 border-b border-gray-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Booking</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{salonName}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{areaLabel}, {cityLabel}</p>
          </div>

          <div className="space-y-4 text-sm">
            <Row label="Customer" value={booking.customerName} />
            <Row label="Date" value={date} />
            <Row label="Time" value={time} />
            <Row label="Duration" value={`${booking.durationMins} min`} />
            {booking.staffDetail && (
              <Row label="Staff" value={booking.staffDetail.user.fullName} />
            )}
            <Row label="Amount" value={`₹${booking.totalAmount.toLocaleString("en-IN")}`} />
            <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-4">
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">Booking ID</span>
              <span className="font-mono text-xs font-semibold text-gray-900">{booking.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-3">
          {booking.status === "confirmed" && (
            <a
              href={gcal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <CalendarIcon /> Add to Google Calendar
            </a>
          )}

          {booking.storefront.tenant.phone && (
            <a
              href={`https://wa.me/${booking.storefront.tenant.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi! I have a booking (${booking.id.slice(-8).toUpperCase()}) at ${salonName}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <WhatsAppIcon /> Contact salon on WhatsApp
            </a>
          )}

          <Link
            href={storefrontHref}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-colors"
          >
            ← Back to {salonName}
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-400">
          Questions? Contact {salonName} directly
          {booking.storefront.tenant.phone ? ` at ${booking.storefront.tenant.phone}` : ""}.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
      <span className="text-right font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
