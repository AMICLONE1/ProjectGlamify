// Sliding-window rate limiter with two backends:
//
//   Production (Vercel): uses @vercel/kv (Redis) — accurate across all serverless instances.
//   Dev / no KV env:     falls back to an in-process Map — accurate on a single process.
//
// The backend is selected automatically at runtime based on whether KV_REST_API_URL is set.
// No code change needed when deploying; just add the KV env vars in Vercel dashboard.

import { kv } from "@vercel/kv";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

// ─── In-memory fallback (dev) ─────────────────────────────────────────────────

type Window = { count: number; resetAt: number };
const memStore = new Map<string, Window>();

setInterval(() => {
  const now = Date.now();
  for (const [k, w] of memStore) if (w.resetAt < now) memStore.delete(k);
}, 60_000);

function rateLimitMem(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const w = memStore.get(key);
  if (!w || w.resetAt < now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (w.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((w.resetAt - now) / 1000) };
  }
  w.count += 1;
  return { allowed: true };
}

// ─── Vercel KV backend (production) ──────────────────────────────────────────
//
// Uses a Redis sorted set as a sliding-log counter:
//   INCR  rl:{key}
//   EXPIRE rl:{key} windowSecs   (only on first request in window)
//
// This is a fixed-window approach (not true sliding) but is accurate enough
// for the limits we apply (15 min / 1 hr windows). True sliding log requires
// ZADD + ZREMRANGEBYSCORE which costs more round-trips.

async function rateLimitKv(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const windowSecs = Math.ceil(windowMs / 1000);

  // INCR returns the new count. If it's 1 this is the first request — set TTL.
  const count = await kv.incr(redisKey);
  if (count === 1) {
    await kv.expire(redisKey, windowSecs);
  }

  if (count > limit) {
    const ttl = await kv.ttl(redisKey);
    return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSecs };
  }

  return { allowed: true };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const useKv = !!process.env.KV_REST_API_URL;

/**
 * Rate limit a request.
 *
 * @param key      Bucket identifier (e.g. `booking:ip:1.2.3.4`)
 * @param limit    Max requests allowed per window
 * @param windowMs Window size in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  try {
    return useKv
      ? await rateLimitKv(key, limit, windowMs)
      : rateLimitMem(key, limit, windowMs);
  } catch (err) {
    // If KV is unavailable, fail open (allow the request) and log the error.
    // Better to let a request through than to block all traffic on a KV outage.
    console.error("[rate-limit] KV error, failing open:", err);
    return { allowed: true };
  }
}

/**
 * Extract the real client IP from a Next.js / Vercel request.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Standard 429 response with Retry-After header.
 */
export function rateLimitResponse(retryAfter: number): Response {
  return Response.json(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests. Please wait ${retryAfter} seconds and try again.`,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": "10",
      },
    }
  );
}
