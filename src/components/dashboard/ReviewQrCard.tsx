"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Shows a QR code that opens the salon's public review page. Salons can download
// it and put it at the counter — customers scan → rate → (happy ones) go to Google.

export function ReviewQrCard({ city, slug, salonName }: { city: string; slug: string; salonName: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const reviewUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${city}/${slug}/review`
    : `/${city}/${slug}/review`;

  useEffect(() => {
    QRCode.toDataURL(reviewUrl, { width: 480, margin: 2, color: { dark: "#1a1625", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [reviewUrl]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${slug}-review-qr.png`;
    a.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(reviewUrl).catch(() => {});
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-5">
      <p className="font-semibold text-ink text-sm">Collect reviews with a QR code</p>
      <p className="mt-0.5 text-xs text-muted">
        Print this and keep it at your counter. Customers scan, rate, and happy ones are sent to your Google listing.
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          {dataUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={dataUrl} alt={`Review QR for ${salonName}`} className="h-40 w-40" />
            : <div className="flex h-40 w-40 items-center justify-center text-xs text-muted-2">Generating…</div>}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button onClick={download} disabled={!dataUrl}
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
            ↓ Download QR
          </button>
          <button onClick={copyLink}
            className="rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:border-ink">
            Copy review link
          </button>
          <p className="mt-1 break-all text-[11px] text-muted-2">{reviewUrl}</p>
        </div>
      </div>
    </div>
  );
}
