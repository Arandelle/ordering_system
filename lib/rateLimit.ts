import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding-window in-memory rate limiter.
 *
 * Tracks request counts per key (typically IP) within a rolling time window.
 * Suitable for Vercel serverless — each function instance enforces limits
 * independently, which is sufficient for burst protection.
 */

interface WindowEntry {
  /** Count from the previous window (used for sliding calculation) */
  prev: number;
  /** Count in the current window */
  curr: number;
  /** Timestamp when the current window started */
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

/**
 * Prune expired entries when the store grows too large.
 * Runs lazily — only triggered when the store exceeds the threshold.
 */
const MAX_STORE_SIZE = 10_000;
function pruneExpired(now: number) {
  if (store.size <= MAX_STORE_SIZE) return;
  for (const [key, entry] of store) {
    if (now - entry.windowStart > entry.windowStart) {
      store.delete(key);
    }
  }
}

interface CheckResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Check whether a request should be allowed under the rate limit.
 *
 * @param key      Unique identifier per caller (IP, user ID, etc.)
 * @param limit    Max requests allowed within the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): CheckResult {
  const now = Date.now();

  // Reset stale entries
  if (!store.has(key)) {
    store.set(key, { prev: 0, curr: 0, windowStart: now });
  }

  const entry = store.get(key)!;
  const elapsed = now - entry.windowStart;

  // Roll window forward when expired
  if (elapsed >= windowMs) {
    entry.prev = entry.curr;
    entry.curr = 0;
    entry.windowStart = now;
  }

  // Sliding-window weighted count: blends previous and current window
  // based on how far into the current window we are.
  const weight = Math.max(0, 1 - elapsed / windowMs);
  const estimated = Math.floor(entry.prev * weight) + entry.curr;

  if (estimated >= limit) {
    const retryAfterSec = Math.ceil(
      (entry.windowStart + windowMs - now) / 1000,
    );
    return { allowed: false, limit, remaining: 0, retryAfterSec };
  }

  entry.curr++;
  return { allowed: true, limit, remaining: limit - entry.curr, retryAfterSec: 0 };
}

/**
 * Extract the client IP from standard proxy headers.
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// ---------------------------------------------------------------------------
// Presets — tweak these as needed per route category
// ---------------------------------------------------------------------------

export const RATE_LIMIT_PRESETS = {
  /** General API endpoints — 60 req/min */
  api: { limit: 60, windowMs: 60_000 },
  /** Auth endpoints (login, register) — 10 req/min to block brute-force */
  auth: { limit: 10, windowMs: 60_000 },
  /** High-cost queries (activity logs, reports, dashboard) — 20 req/min */
  strict: { limit: 20, windowMs: 60_000 },
  /** Write operations (create, update, delete) — 30 req/min */
  write: { limit: 30, windowMs: 60_000 },
  /** Public / read-only endpoints (products, categories) — 100 req/min */
  public: { limit: 100, windowMs: 60_000 },
  /** Webhooks (Paymaya, Inngest) — 60 req/min */
  webhook: { limit: 60, windowMs: 60_000 },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/**
 * Standard 429 response returned when a caller exceeds the rate limit.
 */
export function rateLimitResponse(result: CheckResult, path: string) {
  console.warn(
    `[RateLimit] 429 — ${path} — retry after ${result.retryAfterSec}s`,
  );

  return NextResponse.json(
    {
      error: "Too many requests. Please slow down.",
      retryAfter: result.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Route handler wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap a Next.js route handler with rate limiting.
 *
 * Usage:
 * ```ts
 * export const GET = withRateLimit(async (request) => {
 *   // your handler
 * }, "strict");
 * ```
 *
 * @param handler    The original route handler function
 * @param preset     Preset name or custom { limit, windowMs } config
 * @param keyPrefix  Optional namespace to isolate rate-limit buckets
 */
export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse | Response>>(
  handler: T,
  preset: RateLimitPreset | { limit: number; windowMs: number } = "api",
  keyPrefix = "",
): T {
  const config = typeof preset === "string" ? RATE_LIMIT_PRESETS[preset] : preset;

  const wrapped = async (request: NextRequest, ...rest: any[]) => {
    const ip = getClientIP(request);
    const path = new URL(request.url).pathname;
    const key = `${keyPrefix || path}:${ip}`;

    const result = checkRateLimit(key, config.limit, config.windowMs);

    if (!result.allowed) {
      return rateLimitResponse(result, path);
    }

    return handler(request, ...rest);
  };

  return wrapped as T;
}
