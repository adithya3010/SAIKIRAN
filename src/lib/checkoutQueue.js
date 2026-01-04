import { getRedis } from '@/lib/redis';

const QUEUE_KEY = 'queue:checkout:v1';
const DEAD_KEY = 'queue:checkout:dead:v1';
const STATUS_PREFIX = 'checkout:status:v1:';

function statusKey(jobId) {
  return `${STATUS_PREFIX}${jobId}`;
}

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

export async function setCheckoutJobStatus(jobId, status, ttlSeconds = 60 * 60 * 24) {
  try {
    const redis = getRedis();
    if (!redis) return false;
    await redis.set(statusKey(jobId), JSON.stringify(status), { ex: ttlSeconds });
    return true;
  } catch {
    return false;
  }
}

export async function getCheckoutJobStatus(jobId) {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const raw = await redis.get(statusKey(jobId));
    if (!raw) return null;
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

export async function moveToDeadLetter(job, reason) {
  try {
    const redis = getRedis();
    if (!redis) return false;
    const entry = {
      ...job,
      failedAt: Date.now(),
      reason: reason || 'failed',
    };
    await redis.lpush(DEAD_KEY, JSON.stringify(entry));
    return true;
  } catch {
    return false;
  }
}

function tryExtractJobId(raw) {
  if (typeof raw !== 'string') return null;
  const m = raw.match(/"id"\s*:\s*"([^"]+)"/);
  return m?.[1] || null;
}

function normalizeDequeuedJob(raw) {
  if (!raw) return { job: null, raw: null };

  // Upstash may already deserialize JSON values.
  if (typeof raw === 'object') {
    return { job: raw, raw };
  }

  if (typeof raw !== 'string') {
    return { job: null, raw };
  }

  try {
    return { job: JSON.parse(raw), raw };
  } catch {
    return { job: null, raw };
  }
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

    const { job, raw: rawValue } = normalizeDequeuedJob(raw);
    if (job) {
      jobs.push(job);
      continue;
    }

    // Don't silently drop; keep for debugging.
    const deadEntry = {
      raw: rawValue,
      extractedJobId: tryExtractJobId(rawValue),
      failedAt: Date.now(),
      reason: 'malformed-queue-entry',
    };
    try {
      await redis.lpush(DEAD_KEY, JSON.stringify(deadEntry));
    } catch {
      // ignore
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
