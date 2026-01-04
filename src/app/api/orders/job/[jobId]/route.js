import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCheckoutJobStatus } from '@/lib/checkoutQueue';

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(params);
  const jobIdFromParams = resolvedParams?.jobId;
  const jobIdFromPath = (() => {
    try {
      const url = new URL(req.url);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    } catch {
      return '';
    }
  })();

  const jobId = jobIdFromParams || jobIdFromPath;
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }
  const status = await getCheckoutJobStatus(jobId);
  if (!status) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Only the creator can view job status.
  const sessionUserId = String(session?.user?.id || session?.user?._id || '');
  const statusUserId = String(status?.userId || '');

  if (session?.user?.role !== 'admin' && statusUserId && sessionUserId && statusUserId !== sessionUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true, status });
}
