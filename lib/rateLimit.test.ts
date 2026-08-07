import assert from "node:assert/strict";
import test, { describe, beforeEach } from "node:test";
import { NextRequest } from "next/server";
import {
  checkRateLimit,
  getClientIP,
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "./rateLimit";

// ---------------------------------------------------------------------------
// Helper: reset the in-memory store between tests by using unique keys
// ---------------------------------------------------------------------------

let keyCounter = 0;
function uniqueKey() {
  return `test-${++keyCounter}-${Date.now()}`;
}

function makeRequest(
  url = "http://localhost:3000/api/test",
  headers: Record<string, string> = {},
) {
  return new NextRequest(url, { headers });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("checkRateLimit", () => {
  test("allows requests under the limit", () => {
    const key = uniqueKey();
    const limit = 5;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i++) {
      const result = checkRateLimit(key, limit, windowMs);
      assert.equal(result.allowed, true, `request ${i + 1} should be allowed`);
      assert.equal(result.remaining, limit - i - 1);
    }
  });

  test("blocks requests at the limit", () => {
    const key = uniqueKey();
    const limit = 3;
    const windowMs = 60_000;

    // Exhaust the limit
    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, windowMs);
    }

    // Next request should be blocked
    const result = checkRateLimit(key, limit, windowMs);
    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 0);
    assert.ok(result.retryAfterSec > 0, "retryAfterSec should be positive");
    assert.ok(result.retryAfterSec <= 60, "retryAfterSec should be <= window");
  });

  test("returns correct limit in result", () => {
    const key = uniqueKey();
    const result = checkRateLimit(key, 42, 60_000);
    assert.equal(result.limit, 42);
  });

  test("different keys have independent buckets", () => {
    const keyA = uniqueKey();
    const keyB = uniqueKey();
    const limit = 2;
    const windowMs = 60_000;

    // Exhaust keyA
    checkRateLimit(keyA, limit, windowMs);
    checkRateLimit(keyA, limit, windowMs);

    // keyA should be blocked
    assert.equal(checkRateLimit(keyA, limit, windowMs).allowed, false);

    // keyB should still be allowed
    assert.equal(checkRateLimit(keyB, limit, windowMs).allowed, true);
  });

  test("resets after window expires", async () => {
    const key = uniqueKey();
    const limit = 2;
    const windowMs = 50; // 50ms for fast test

    // Exhaust the limit
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);
    assert.equal(checkRateLimit(key, limit, windowMs).allowed, false);

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, windowMs + 10));

    // Should be allowed again
    const result = checkRateLimit(key, limit, windowMs);
    assert.equal(result.allowed, true);
  });
});

describe("getClientIP", () => {
  test("extracts IP from x-forwarded-for header", () => {
    const req = makeRequest("http://localhost/api/test", {
      "x-forwarded-for": "203.0.113.50, 10.0.0.1",
    });
    assert.equal(getClientIP(req), "203.0.113.50");
  });

  test("extracts IP from x-real-ip header", () => {
    const req = makeRequest("http://localhost/api/test", {
      "x-real-ip": "192.168.1.1",
    });
    assert.equal(getClientIP(req), "192.168.1.1");
  });

  test("falls back to 'unknown' when no headers present", () => {
    const req = makeRequest();
    assert.equal(getClientIP(req), "unknown");
  });
});

describe("RATE_LIMIT_PRESETS", () => {
  test("auth is stricter than api", () => {
    assert.ok(RATE_LIMIT_PRESETS.auth.limit < RATE_LIMIT_PRESETS.api.limit);
  });

  test("strict is stricter than api", () => {
    assert.ok(RATE_LIMIT_PRESETS.strict.limit < RATE_LIMIT_PRESETS.api.limit);
  });

  test("public allows more than api", () => {
    assert.ok(RATE_LIMIT_PRESETS.public.limit > RATE_LIMIT_PRESETS.api.limit);
  });

  test("all presets use 60-second windows", () => {
    for (const [, config] of Object.entries(RATE_LIMIT_PRESETS)) {
      assert.equal(config.windowMs, 60_000);
    }
  });
});

describe("withRateLimit", () => {
  test("passes through to handler when under limit", async () => {
    const { NextResponse } = await import("next/server");

    const handler = async (req: NextRequest) => {
      return NextResponse.json({ ok: true });
    };

    const wrapped = withRateLimit(handler, { limit: 10, windowMs: 60_000 });
    const req = makeRequest();
    const res = await wrapped(req);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
  });

  test("returns 429 when limit is exceeded", async () => {
    const { NextResponse } = await import("next/server");

    const handler = async (_req: NextRequest) => {
      return NextResponse.json({ ok: true });
    };

    // Custom low limit for testing
    const wrapped = withRateLimit(handler, { limit: 2, windowMs: 60_000 }, uniqueKey());
    const req = makeRequest();

    // Exhaust the limit
    await wrapped(req);
    await wrapped(req);

    // Third request should be blocked
    const res = await wrapped(req);
    assert.equal(res.status, 429);

    const body = await res.json();
    assert.ok(body.error.includes("Too many"));
    assert.ok(typeof body.retryAfter === "number");
  });

  test("includes Retry-After header on 429", async () => {
    const { NextResponse } = await import("next/server");

    const handler = async (_req: NextRequest) => NextResponse.json({ ok: true });
    const wrapped = withRateLimit(handler, { limit: 1, windowMs: 60_000 }, uniqueKey());
    const req = makeRequest();

    await wrapped(req); // exhaust
    const res = await wrapped(req); // blocked

    assert.equal(res.status, 429);
    assert.ok(res.headers.get("Retry-After"), "Retry-After header should exist");
  });

  test("uses preset string to select config", async () => {
    const { NextResponse } = await import("next/server");

    const handler = async (_req: NextRequest) => NextResponse.json({ ok: true });

    // "auth" preset = 10 req/min — just verify it doesn't throw
    const wrapped = withRateLimit(handler, "auth", uniqueKey());
    const req = makeRequest();
    const res = await wrapped(req);

    assert.equal(res.status, 200);
  });
});
