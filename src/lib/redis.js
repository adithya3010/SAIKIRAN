import { Redis } from '@upstash/redis';

/**
 * Upstash Redis (REST) client.
 *
 * Env vars (Vercel):
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
export function getRedis() {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const url = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^"|"$/g, '') : rawUrl;
  const token = typeof rawToken === 'string' ? rawToken.trim().replace(/^"|"$/g, '') : rawToken;

  if (!url || !token) return null;

  // Create a new client per invocation; the REST client is lightweight.
  return new Redis({ url, token });
}
