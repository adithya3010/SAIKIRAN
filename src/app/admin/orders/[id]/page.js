"use client";
import React, { useState, useEffect, use } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function AdminOrderDetailsPage({ params }) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Tracking Form State
    const [trackingDetails, setTrackingDetails] = useState({
        carrier: '',
        trackingNumber: '',
        trackingUrl: ''
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if (session.user.role !== 'admin') {
                router.push('/');
                return;
            }
            fetchOrder();
        }
    }, [status, router, id, session]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                if (data.trackingDetails) {
                    setTrackingDetails({
                        carrier: data.trackingDetails.carrier || '',
                        trackingNumber: data.trackingDetails.trackingNumber || '',
                        trackingUrl: data.trackingDetails.trackingUrl || ''
                    });
                }
            } else {
                router.push('/admin/orders');
            }
        } catch (error) {
            console.error("Failed to fetch order");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!confirm(`Update order status to ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
            }
        } catch (error) {
            console.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateTracking = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: order.status, // Keep status same
                    trackingDetails: trackingDetails
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
                alert("Tracking details updated!");
            }
        } catch (error) {
            console.error("Failed to update tracking");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!order) return null;

    const allStatuses = ['Placed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-bg-secondary border border-border-primary rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                            <p className="text-text-muted text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider 
                            ${order.status === 'Processing' || order.status === 'Packed' || order.status === 'Placed' ? 'bg-yellow-500/10 text-yellow-500' :
                                order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                        'bg-blue-500/10 text-blue-500'}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                        <h2 className="font-bold mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="relative w-16 h-20 bg-bg-tertiary rounded flex-shrink-0">
                                        {(item.image || item.product?.images?.[0]) && (
                                            <Image src={item.image || item.product?.images?.[0]} alt={item.name} fill className="object-cover rounded" sizes="64px" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold">{item.name}</p>
                                        <p className="text-sm text-text-muted">Size: {item.selectedSize} | Color: {item.selectedColor?.name}</p>
                                        <p className="text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="ml-auto font-bold">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="font-bold mb-4">Customer</h2>
                            <p>{order.user?.name}</p>
                            <p className="text-sm text-text-muted">{order.user?.email}</p>
                        </div>
                        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                            <h2 className="font-bold mb-4">Shipping Address</h2>
                            <p>{order.shippingAddress?.fullName}</p>
                            <p className="text-sm text-text-muted">
                                {order.shippingAddress?.address}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                {order.shippingAddress?.country}<br />
                                Phone: {order.shippingAddress?.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                        <h2 className="font-bold mb-4">Update Status</h2>
                        <div className="space-y-2">
                            {allStatuses.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleUpdateStatus(s)}
                                    disabled={updating || order.status === s}
                                    className={`w-full text-left px-4 py-2 rounded text-sm transition-colors
                                        ${order.status === s ? 'bg-primary text-bg-primary font-bold' : 'hover:bg-bg-tertiary'}
                                    `}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tracking Info Form */}
                    <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                        <h2 className="font-bold mb-4">Tracking Information</h2>
                        <form onSubmit={handleUpdateTracking} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-text-muted font-bold mb-1">Carrier</label>
                                <input
                                    type="text"
                                    className="w-full bg-bg-primary border border-border-secondary rounded p-2 text-sm"
                                    placeholder="e.g. FedEx, BlueDart"
                                    value={trackingDetails.carrier}
                                    onChange={e => setTrackingDetails({ ...trackingDetails, carrier: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-text-muted font-bold mb-1">Tracking Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-bg-primary border border-border-secondary rounded p-2 text-sm"
                                    placeholder="Tracking ID"
                                    value={trackingDetails.trackingNumber}
                                    onChange={e => setTrackingDetails({ ...trackingDetails, trackingNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-text-muted font-bold mb-1">Tracking URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-bg-primary border border-border-secondary rounded p-2 text-sm"
                                    placeholder="https://..."
                                    value={trackingDetails.trackingUrl}
                                    onChange={e => setTrackingDetails({ ...trackingDetails, trackingUrl: e.target.value })}
                                />
                            </div>
                            <Button className="w-full" disabled={updating}>save tracking info</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
