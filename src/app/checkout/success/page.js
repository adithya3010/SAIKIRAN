"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useCart } from "@/context/CartContext";

export default function OrderSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="bg-bg-secondary p-8 rounded-lg border border-border-primary text-center max-w-md w-full">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
                <p className="text-text-muted mb-8">Thank you for your purchase. Your order has been confirmed.</p>

                <div className="space-y-4">
                    <Link href="/account/orders" className="block w-full">
                        <Button variant="solid" className="w-full">
                            View Your Orders
                        </Button>
                    </Link>

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
