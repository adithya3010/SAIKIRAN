import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET(request) {
  const url = new URL(request.url);

  const secret = process.env.CHECKOUT_WORKER_SECRET;
  const provided = url.searchParams.get('secret') || '';
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }

  const queueKey = 'queue:checkout:v1';
  const deadKey = 'queue:checkout:dead:v1';

  const peek = url.searchParams.get('peek') === '1';

  const [queueLen, deadLen, queueTail, deadTail] = await Promise.all([
    redis.llen(queueKey),
    redis.llen(deadKey),
    peek ? redis.lrange(queueKey, -1, -1) : Promise.resolve(null),
    peek ? redis.lrange(deadKey, -1, -1) : Promise.resolve(null),
  ]);

  const safeParse = (v) => {
    if (!v) return null;
    if (Array.isArray(v)) return safeParse(v[0]);
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };

  return NextResponse.json({
    success: true,
    queue: { key: queueKey, length: Number(queueLen) },
    dead: { key: deadKey, length: Number(deadLen) },
    ...(peek
      ? {
          peek: {
            queueTail: safeParse(queueTail),
            deadTail: safeParse(deadTail),
          },
        }
      : {}),
  });
}
