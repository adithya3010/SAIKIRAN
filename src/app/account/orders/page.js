"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function OrderHistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchOrders();
        }
    }, [status, router]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground pt-32 flex justify-center">
                <div className="animate-pulse">Loading Orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 md:pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                        <p className="text-muted-foreground">Track and view your order history</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 && (
                        <div className="text-text-muted text-center py-10 border border-dashed border-border-primary rounded-lg">
                            No orders found.
                        </div>
                    )}

                    {orders.map((order) => (
                        <div key={order._id} className="bg-bg-secondary border border-border-primary p-6 rounded-lg animate-fade-in group hover:border-foreground transition-colors">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-border-primary pb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                                    <p className="text-sm text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                                        ${order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-blue-500/10 text-blue-500'}`}>
                                        {order.status}
                                    </span>
                                    <Button size="sm" variant="outline" onClick={() => router.push(`/account/orders/${order._id}`)}>
                                        View Details
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {order.items.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="relative w-16 h-20 bg-bg-tertiary rounded overflow-hidden">
                                        {(item.image || item.product?.images?.[0]) && (
                                            <img src={item.image || item.product?.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                                {order.items.length > 4 && (
                                    <div className="w-16 h-20 bg-bg-tertiary rounded flex items-center justify-center text-xs font-bold text-text-muted">
                                        +{order.items.length - 4}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-2 flex justify-between items-center text-sm font-medium">
                                <span>{order.items.length} Items</span>
                                <span>Total: ₹{order.totalPrice}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
