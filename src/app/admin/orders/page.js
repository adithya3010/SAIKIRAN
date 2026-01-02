"use client";
import React, { useState, useEffect } from 'react';
import { mockOrders } from '@/lib/data';

export default function AdminOrdersPage() {
    const [filterStatus, setFilterStatus] = useState('All');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div className="p-8 md:p-12 pb-20">
            <div className="mb-10">
                <h1 className="text-4xl font-outfit font-bold uppercase mb-2">Orders</h1>
                <p className="text-grey-400">Track and manage customer orders.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
                {statuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filterStatus === status
                            ? 'bg-white text-black'
                            : 'text-grey-500 hover:text-white bg-white/5'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-grey-400 uppercase tracking-wider text-xs font-bold">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Items</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-grey-500">Loading orders...</td></tr>
                            ) : filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-grey-300 font-bold">{order._id.substring(0, 8)}...</td>
                                    <td className="p-4 font-medium text-white">{order.user?.name || 'Guest'}</td>
                                    <td className="p-4 text-grey-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-grey-400">{order.items.length} Items</td>
                                    <td className="p-4 text-right font-mono text-white">₹{order.totalPrice.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === 'Delivered' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                            order.status === 'Processing' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                order.status === 'Cancelled' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                    'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-white hover:text-grey-300 underline text-xs uppercase tracking-widest">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-grey-500">
                        No orders found with status "{filterStatus}".
                    </div>
                )}
            </div>
        </div>
    );
}
