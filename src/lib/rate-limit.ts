interface Bucket { count: number; expiresAt: number }

/** Best-effort per-instance protection. Use a shared store for scaled deployments. */
export function createRateLimiter({ limit = 5, windowMs = 10 * 60_000, maxKeys = 10_000 } = {}) {
  const buckets = new Map<string, Bucket>();
  return {
    consume(key: string, now = Date.now()) {
      for (const [id, bucket] of buckets) {
        if (bucket.expiresAt <= now) buckets.delete(id);
      }
      const existing = buckets.get(key);
      if (!existing && buckets.size >= maxKeys) return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
      const bucket = existing ?? { count: 0, expiresAt: now + windowMs };
      bucket.count += 1;
      buckets.set(key, bucket);
      return {
        allowed: bucket.count <= limit,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)),
      };
    },
  };
}
