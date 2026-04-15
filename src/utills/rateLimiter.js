/**
 * In-memory rate limiter for API route protection.
 *
 * Tracks request counts per key (e.g. IP or username) within a sliding window.
 * Stale entries are periodically pruned to prevent memory leaks.
 *
 * For production deployments with multiple server instances, replace this
 * with a Redis-backed rate limiter.
 */

const stores = new Map();

function getStore(name) {
  if (!stores.has(name)) {
    const store = new Map();
    stores.set(name, store);

    // Prune expired entries every 60 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now - entry.windowStart > entry.windowMs) {
          store.delete(key);
        }
      }
    }, 60_000);
    // Allow the Node.js process to exit even if the interval is still active
    if (interval.unref) {
      interval.unref();
    }
  }
  return stores.get(name);
}

/**
 * Create a rate limiter with the given configuration.
 *
 * @param {object} options
 * @param {string} options.name      - Unique name for this limiter's store
 * @param {number} options.windowMs  - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests allowed per window
 * @returns {function(string): { allowed: boolean, retryAfterMs: number }}
 */
export function createRateLimiter({ name, windowMs, maxRequests }) {
  const store = getStore(name);

  return function check(key) {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      store.set(key, { count: 1, windowStart: now, windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count < maxRequests) {
      entry.count += 1;
      return { allowed: true, retryAfterMs: 0 };
    }

    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  };
}
