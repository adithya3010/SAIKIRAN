import { getRedis } from '@/lib/redis';

const QUEUE_KEY = 'queue:checkout:v1';

export function createCheckoutJob(payload) {
  return {
    id: `job_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    payload,
  };
}

export async function enqueueCheckoutJob(job) {
  const redis = getRedis();
  if (!redis) throw new Error('Redis not configured');

  // LPUSH to add to head; worker will RPOP to process FIFO.
  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  return job.id;
}

/**
 * Pop up to `max` jobs (FIFO) from Redis.
 * Returns parsed job objects.
 */
export async function dequeueCheckoutJobs(max = 10) {
  const redis = getRedis();
  if (!redis) throw new Error('Redis not configured');

  const jobs = [];
  for (let i = 0; i < max; i += 1) {
    // RPOP for FIFO when paired with LPUSH.
    const raw = await redis.rpop(QUEUE_KEY);
    if (!raw) break;
    try {
      jobs.push(JSON.parse(raw));
    } catch {
      // Ignore malformed entries.
    }
  }
  return jobs;
}

export async function getCheckoutQueueLength() {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.llen(QUEUE_KEY);
  } catch {
    return null;
  }
}
