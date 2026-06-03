import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Clitell — The AI-first operating system for beauty & wellness";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  // Embed the real wordmark (black, transparent) so brand is exact.
  const wordmark = await readFile(
    join(process.cwd(), "public", "ClitellMarkBlack-trim.png")
  );
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          background: "#fbf8f3",
          color: "#1a0e14",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wordmarkSrc} alt="Clitell" height={56} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 22,
              color: "#e8412a",
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", width: 32, height: 2, background: "#ff5840" }} />
            For salons, spas &amp; clinics in India
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: -4,
              textTransform: "uppercase",
              maxWidth: 1040,
            }}
          >
            <div style={{ display: "flex", color: "#0d0608" }}>Run your salon.</div>
            <div style={{ display: "flex", color: "#ff5840" }}>Bill, book, grow.</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#6b5560",
              marginTop: 32,
              maxWidth: 900,
            }}
          >
            Booking · Billing · CRM · Loyalty · AI · Built for India.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
