import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../../src/lib/rate-limit";

describe("order rate limiting", () => {
  it("limits each client and resets after the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    assert.equal(limiter.consume("a", 0).allowed, true);
    assert.equal(limiter.consume("a", 100).allowed, true);
    assert.equal(limiter.consume("a", 200).allowed, false);
    assert.equal(limiter.consume("b", 200).allowed, true);
    assert.equal(limiter.consume("a", 1001).allowed, true);
  });
  it("bounds memory and reports a retry interval", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 1 });
    assert.equal(limiter.consume("a", 0).allowed, true);
    assert.equal(limiter.consume("b", 0).allowed, false);
    assert.equal(limiter.consume("a", 1).retryAfterSeconds, 60);
    assert.equal(limiter.consume("b", 60_001).allowed, true);
  });
});
