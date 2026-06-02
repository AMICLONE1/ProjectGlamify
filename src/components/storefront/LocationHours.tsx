import type { Storefront } from "@/content/storefronts";

type Props = {
  storefront: Pick<Storefront, "address" | "phone" | "geoLat" | "geoLng" | "hours" | "name">;
};

const DAY_LABELS: { key: keyof Storefront["hours"]; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function LocationHours({ storefront }: Props) {
  const todayIdx = new Date().getDay(); // 0=Sun
  const dayKeys: (keyof Storefront["hours"])[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayKey = dayKeys[todayIdx];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${storefront.geoLat},${storefront.geoLng}`;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 border-t border-border">
      <h2 className="eyebrow mb-6">Location & Hours</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Address + map link */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-4 flex items-start gap-3">
            <svg className="mt-0.5 shrink-0 text-muted" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5C6.5 1.5 4.5 3.5 4.5 6c0 4 4.5 10.5 4.5 10.5S13.5 10 13.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="9" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div>
              <p className="font-semibold text-ink text-sm">{storefront.address}</p>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <svg className="shrink-0 text-muted" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c.5 1 1.5 2 2.5 2.5l.5-.5c.5-.5 1.5-.5 2 0l1.5 1.5c.5.5.5 1.5 0 2l-.5.5c-1 1-2.5.5-4-1S4.5 9 3 7.5 1.5 4 2.5 3l.5-.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <a href={`tel:${storefront.phone}`} className="text-sm text-brand-600 hover:underline">
              {storefront.phone}
            </a>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H5M12 2v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open in Google Maps
          </a>
        </div>

        {/* Hours */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <table className="w-full text-sm">
            <tbody>
              {DAY_LABELS.map(({ key, label }) => {
                const h = storefront.hours[key];
                const isToday = key === todayKey;
                return (
                  <tr key={key} className={isToday ? "font-semibold text-ink" : "text-muted"}>
                    <td className="py-1 pr-4 w-28">
                      {label}
                      {isToday && (
                        <span className="ml-1.5 text-xs text-brand-500">today</span>
                      )}
                    </td>
                    <td className="py-1">
                      {h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
