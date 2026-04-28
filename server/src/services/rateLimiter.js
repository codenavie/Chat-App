export function createRateLimiter(limit = 120, windowMs = 60000) {
  const buckets = new Map();

  return function isLimited(socketId) {
    const now = Date.now();
    const entry = buckets.get(socketId) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    buckets.set(socketId, entry);

    return entry.count > limit;
  };
}
