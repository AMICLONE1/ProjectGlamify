// OTP sending abstraction.
// Provider selected via OTP_PROVIDER env var:
//   "msg91"   → real SMS via MSG91 (India)
//   "console" → prints OTP to server console (dev/test fallback)

export type OtpType = "booking" | "checkin" | "login" | "signup";

const PROVIDER = process.env.OTP_PROVIDER ?? "console";

// ─── MSG91 ────────────────────────────────────────────────────────────────────
// Uses MSG91's /otp endpoint — no DLT template needed for basic OTP delivery.
// Docs: https://docs.msg91.com/reference/send-otp

async function sendViaMSG91(phone: string, otp: string): Promise<void> {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) throw new Error("MSG91_AUTH_KEY not set");

  const templateId = process.env.MSG91_BOOKING_OTP_TEMPLATE_ID;

  // Build request — template_id is optional; MSG91 uses a default if not set
  const body: Record<string, string> = {
    mobile:  `91${phone}`,
    authkey: authKey,
    otp,
  };
  if (templateId) body.template_id = templateId;

  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method:  "POST",
    headers: { "Content-Type": "application/json", authkey: authKey },
    body:    JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.type === "error") {
    throw new Error(`MSG91 error: ${data?.message ?? res.status}`);
  }
}

// ─── Console fallback ────────────────────────────────────────────────────────

function sendViaConsole(phone: string, otp: string, type: OtpType): void {
  const border = "─".repeat(50);
  console.log(`\n${border}`);
  console.log(`  📱 OTP [${type.toUpperCase()}] → +91${phone}`);
  console.log(`  Code: \x1b[32m\x1b[1m${otp}\x1b[0m`);
  console.log(`  (console fallback — OTP_PROVIDER=msg91 for real SMS)`);
  console.log(`${border}\n`);
}

// ─── In-process OTP store (dev / no-Redis fallback) ──────────────────────────
// In production replace with Upstash Redis using SETNX + TTL.

const OTP_STORE = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtpDev(key: string, otp: string, ttlSeconds = 600): void {
  OTP_STORE.set(key, { otp, expiresAt: Date.now() + ttlSeconds * 1000, attempts: 0 });
  setTimeout(() => OTP_STORE.delete(key), ttlSeconds * 1000);
}

export function verifyOtpDev(
  key: string,
  otp: string
): "valid" | "expired" | "invalid" | "not_found" {
  const entry = OTP_STORE.get(key);
  if (!entry) return "not_found";
  if (Date.now() > entry.expiresAt) { OTP_STORE.delete(key); return "expired"; }
  entry.attempts += 1;
  if (entry.attempts > 5) { OTP_STORE.delete(key); return "invalid"; }
  if (entry.otp !== otp) return "invalid";
  OTP_STORE.delete(key); // single-use
  return "valid";
}

// ─── Public send API ──────────────────────────────────────────────────────────

export async function sendOtp(
  phone: string,
  otp: string,
  type: OtpType = "booking"
): Promise<void> {
  const useReal = PROVIDER === "msg91" && !!process.env.MSG91_AUTH_KEY;

  if (useReal) {
    try {
      await sendViaMSG91(phone, otp);
      console.log(`[OTP] MSG91 sent to +91${phone}`);
      return;
    } catch (err) {
      console.error("[OTP] MSG91 failed, falling back to console:", err);
    }
  }

  sendViaConsole(phone, otp, type);
}
