"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function OrderDetailsPage({ params }) {
    const { id } = params;
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchOrder();
        }
    }, [status, router, id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                router.push('/account/orders'); // Redirect on fail
            }
        } catch (error) {
            console.error("Failed to fetch order");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground pt-32 flex justify-center">
                <div className="animate-pulse">Loading Order Details...</div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 md:pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Order #{order.orderNumber}</h1>
                        <p className="text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider 
                        ${order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                                order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                    'bg-blue-500/10 text-blue-500'}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-6 border-b border-border-primary pb-4">Items</h2>
                            <div className="space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex gap-4 flex-1">
                                            <div className="relative w-24 h-32 bg-bg-tertiary rounded overflow-hidden flex-shrink-0">
                                                {(item.image || item.product?.images?.[0]) && (
                                                    <Image src={item.image || item.product?.images?.[0]} alt={item.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                <p className="text-sm text-text-muted">Size: {item.selectedSize}</p>
                                                <p className="text-sm text-text-muted">Color: {item.selectedColor?.name}</p>
                                                <p className="text-sm text-text-muted mt-2">Qty: {item.quantity} x ₹{item.price}</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-lg">
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Info */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Subtotal</span>
                                    <span>₹{order.itemsPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Shipping</span>
                                    <span>₹{order.shippingPrice}</span>
                                </div>
                                <div className="border-t border-border-primary pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{order.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                            <div className="text-sm text-text-muted space-y-1">
                                <p className="font-bold text-foreground">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                                <p>{order.shippingAddress?.country}</p>
                                <p className="pt-2">Phone: {order.shippingAddress?.phone}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Payment</h2>
                            <p className="text-sm text-text-muted font-medium mb-1">Method: <span className="text-foreground">{order.paymentMethod}</span></p>
                            <p className="text-sm text-text-muted">Status: <span className={order.isPaid ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>{order.isPaid ? "Paid" : "Pending"}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
