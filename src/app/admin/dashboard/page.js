"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { mockOrders, mockUsers, products } from "@/lib/data";

const StatCard = ({ title, value, subtext, trend }) => (
    <div className="bg-bg-secondary p-6 rounded-xl border border-border-primary hover:border-foreground/30 transition-colors">
        <h3 className="text-text-muted uppercase tracking-widest text-xs font-bold mb-2">{title}</h3>
        <p className="text-3xl font-outfit font-bold text-foreground mb-1">{value}</p>
        <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} 12%
            </span>
            <span className="text-text-muted text-xs">{subtext}</span>
        </div>
    </div>
);

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/"); // Redirect non-admins to home
        }
    }, [status, session, router]);

    if (status === "loading") return <div className="text-foreground p-8">Loading...</div>;
    if (!session || session.user.role !== "admin") return null;

    // Calculate Stats
    const totalRevenue = mockOrders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = mockOrders.length;
    const totalUsers = mockUsers.length;
    const lowStockProducts = products.filter(p => !p.inStock || p.inStock < 10); // Mock check

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-outfit font-bold uppercase mb-2 text-foreground">Dashboard</h1>
                    <p className="text-text-muted">Welcome back, Admin</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-muted uppercase tracking-widest">Today's Date</p>
                    <p className="text-lg font-mono text-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} subtext="vs last month" trend="up" />
                <StatCard title="Total Orders" value={totalOrders} subtext="vs last month" trend="up" />
                <StatCard title="Total Customers" value={totalUsers} subtext="new this month" trend="up" />
                <StatCard title="Products" value={products.length} subtext="active in store" trend="up" />
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border-primary flex justify-between items-center">
                    <h3 className="text-lg font-outfit font-bold uppercase text-foreground">Recent Orders</h3>
                    <button onClick={() => router.push('/admin/orders')} className="text-xs uppercase tracking-widest text-text-muted hover:text-foreground transition-colors">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-tertiary text-text-muted uppercase tracking-wider text-xs font-bold">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-primary">
                            {mockOrders.slice(0, 5).map(order => (
                                <tr key={order.id} className="hover:bg-bg-tertiary transition-colors">
                                    <td className="p-4 font-mono text-foreground/70">{order.id}</td>
                                    <td className="p-4 font-medium text-foreground">{order.customer}</td>
                                    <td className="p-4 text-text-muted">{order.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${order.status === 'Delivered' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                                            order.status === 'Processing' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                                order.status === 'Cancelled' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                                    'border-blue-500/30 text-blue-500 bg-blue-500/10'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-foreground">₹{order.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
