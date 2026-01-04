"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useCart } from "@/context/CartContext";

export default function OrderSuccessPage() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId') || '';

    const [jobStatus, setJobStatus] = useState(null);
    const [error, setError] = useState('');

    const state = useMemo(() => {
        if (!jobId) return 'unknown';
        const s = jobStatus?.state;
        if (s === 'queued' || s === 'processing' || s === 'succeeded' || s === 'failed') return s;
        return 'processing';
    }, [jobId, jobStatus]);

    useEffect(() => {
        let cancelled = false;

        async function poll() {
            if (!jobId) return;

            for (let i = 0; i < 30; i += 1) {
                try {
                    const res = await fetch(`/api/orders/job/${encodeURIComponent(jobId)}`, {
                        cache: 'no-store',
                    });

                    if (res.status === 404) {
                        // Job status key not found yet; keep polling briefly.
                        await new Promise((r) => setTimeout(r, 1000));
                        continue;
                    }

                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data?.error || 'Failed to fetch job status');
                    }

                    if (cancelled) return;
                    setJobStatus(data.status);

                    if (data.status?.state === 'succeeded') {
                        clearCart();
                        return;
                    }
                    if (data.status?.state === 'failed') {
                        setError(data.status?.error || 'Order processing failed');
                        return;
                    }

                    await new Promise((r) => setTimeout(r, 1000));
                } catch (e) {
                    if (cancelled) return;
                    setError(e?.message || 'Failed to fetch job status');
                    return;
                }
            }
        }

        poll();
        return () => {
            cancelled = true;
        };
    }, [jobId, clearCart]);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="bg-bg-secondary p-8 rounded-lg border border-border-primary text-center max-w-md w-full">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                {state === 'succeeded' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
                        <p className="text-text-muted mb-8">Your order is confirmed.</p>
                    </>
                ) : state === 'failed' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Order Failed</h1>
                        <p className="text-text-muted mb-8">{error || 'Please try placing the order again.'}</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Processing Your Order…</h1>
                        <p className="text-text-muted mb-8">This can take a few seconds. Please keep this page open.</p>
                    </>
                )}

                <div className="space-y-4">
                    {state === 'succeeded' && jobStatus?.orderId ? (
                        <Link href={`/account/orders/${jobStatus.orderId}`} className="block w-full">
                            <Button variant="solid" className="w-full">
                                View Your Order
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/account/orders" className="block w-full">
                            <Button variant="solid" className="w-full">
                                View Your Orders
                            </Button>
                        </Link>
                    )}

                    <Link href="/shop" className="block w-full">
                        <Button variant="outline" className="w-full">
                            Shop More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
