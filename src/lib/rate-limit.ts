// Sliding-window rate limiter — two backends:
//
//   Production (Vercel + Upstash Redis):
//     Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel dashboard.
//     Accurate across all serverless instances.
//
//   Dev / no Redis env:
//     Falls back to an in-process Map — accurate on a single process.
//     Automatically selected when UPSTASH_REDIS_REST_URL is absent.

import { Redis } from "@upstash/redis";

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

// ─── Upstash Redis backend (production) ──────────────────────────────────────
// Fixed-window INCR + EXPIRE — one round-trip per request.

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

async function rateLimitRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const client = getRedis()!;
  const redisKey = `rl:${key}`;
  const windowSecs = Math.ceil(windowMs / 1000);

  const count = await client.incr(redisKey);
  if (count === 1) await client.expire(redisKey, windowSecs);

  if (count > limit) {
    const ttl = await client.ttl(redisKey);
    return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSecs };
  }
  return { allowed: true };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Rate limit a request bucket.
 * @param key      e.g. `booking:ip:1.2.3.4`
 * @param limit    Max requests allowed per window
 * @param windowMs Window size in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) return rateLimitMem(key, limit, windowMs);
  try {
    return await rateLimitRedis(key, limit, windowMs);
  } catch (err) {
    // Fail open on Redis errors — better to let a request through than block all traffic.
    console.error("[rate-limit] Redis error, failing open:", err);
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
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}
