"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    if (status === "loading") {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (!session || session.user.role !== "admin") {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <h2 className="text-xl font-bold mb-2">Total Users</h2>
                    <p className="text-3xl text-grey-400">0</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <h2 className="text-xl font-bold mb-2">Total Orders</h2>
                    <p className="text-3xl text-grey-400">0</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <h2 className="text-xl font-bold mb-2">Revenue</h2>
                    <p className="text-3xl text-grey-400">₹0</p>
                </div>
            </div>
        </div>
    );
}
