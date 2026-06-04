// POST /api/v1/admin/bypass — sets a signed admin-bypass cookie.
// Protected by ADMIN_SECRET env var (must be >= 32 chars).
// Only works when ADMIN_SECRET is set; harmless if the env var is absent.

import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "clitell_admin_bypass";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET ?? "";
  return s.length >= 16 ? s : null;
}

export async function POST(req: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return Response.json({ error: "Admin bypass not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.secret !== secret) {
    return Response.json({ error: "Invalid secret" }, { status: 403 });
  }

  // Simple HMAC-like value: secret + timestamp rounded to the hour so it
  // auto-rotates even if the cookie persists. Not a production HSM — good
  // enough for a personal super-admin bypass on your own site.
  const hourSlot = Math.floor(Date.now() / (1000 * 60 * 60));
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(`clitell-admin:${hourSlot}`);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const token = `${hourSlot}.${Buffer.from(sig).toString("hex")}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return Response.json({ ok: true });
}

// GET — verify whether the current bypass cookie is still valid.
export async function GET(req: NextRequest) {
  const secret = getSecret();
  if (!secret) return Response.json({ valid: false });

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value ?? "";
  const valid = await verifyBypassToken(raw, secret);
  return Response.json({ valid });
}

export async function verifyBypassToken(raw: string, secret: string): Promise<boolean> {
  const parts = raw.split(".");
  if (parts.length !== 2) return false;
  const [slotStr, hex] = parts;
  const slot = parseInt(slotStr, 10);
  if (isNaN(slot)) return false;

  // Accept current hour and the previous hour (handles boundary edge)
  const now = Math.floor(Date.now() / (1000 * 60 * 60));
  if (slot < now - 1 || slot > now) return false;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(`clitell-admin:${slot}`);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigBytes = Buffer.from(hex, "hex");
    return await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, msgData);
  } catch {
    return false;
  }
}
