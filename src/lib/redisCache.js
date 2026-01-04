import { getRedis } from '@/lib/redis';

const DEFAULT_TTL_SECONDS = 60;
const CACHE_PREFIX = 'cache:v1:';

export function cacheKeyForUrl(url) {
  return `${CACHE_PREFIX}${url}`;
}

/**
 * Best-effort cache.
 * - Never throws (Redis errors must not crash requests).
 * - Stores JSON-serializable payloads.
 */
export async function redisGetJson(key) {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get(key);
  } catch (err) {
    console.warn('Redis GET failed:', err?.message || err);
    return null;
  }
}

export async function redisSetJson(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    const redis = getRedis();
    if (!redis) return false;

    // Upstash supports `set(key, value, { ex })`.
    await redis.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (err) {
    console.warn('Redis SET failed:', err?.message || err);
    return false;
  }
}
