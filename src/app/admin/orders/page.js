"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            if (session.user.role !== 'admin') {
                router.push('/');
                return;
            }
            fetchOrders();
        }
    }, [status, router, session]);

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

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`Change status to ${newStatus}?`)) return;
        setUpdating(id);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => o._id === id ? updatedOrder : o));
            }
        } catch (error) {
            console.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground pt-32 flex justify-center">
                <div className="animate-pulse">Loading Admin Orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
                        <p className="text-muted-foreground">Manage and track all customer orders</p>
                    </div>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-bg-tertiary text-text-muted uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-primary">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-bg-tertiary/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium">{order.orderNumber}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{order.user?.name}</div>
                                            <div className="text-xs text-text-muted">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">₹{order.totalPrice}</td>
                                        <td className="px-6 py-4">
                                            <div>{order.paymentMethod}</div>
                                            <div className={`text-xs font-bold ${order.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {order.isPaid ? 'PAID' : 'PENDING'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                                                ${order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                    <select
                                                        className="bg-bg-primary border border-border-secondary text-xs rounded p-1 outline-none"
                                                        value=""
                                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                                        disabled={updating === order._id}
                                                    >
                                                        <option value="" disabled>Update Status</option>
                                                        <option value="Shipped">Mark Shipped</option>
                                                        <option value="Delivered">Mark Delivered</option>
                                                        <option value="Cancelled">Cancel Order</option>
                                                    </select>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => router.push(`/account/orders/${order._id}`)}>
                                                    View
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
