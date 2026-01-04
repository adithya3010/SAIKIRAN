import { Redis } from '@upstash/redis';

/**
 * Upstash Redis (REST) client.
 *
 * Env vars (Vercel):
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  // Create a new client per invocation; the REST client is lightweight.
  return new Redis({ url, token });
}
