import { ImageResponse } from "next/og";

export const alt = "Glamify — AI-first software for beauty & wellness businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#ff5840",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
            }}
          >
            G
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -1, color: "#0d0608" }}>
            Glamify
          </div>
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
            For salons, spas & clinics in India
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
