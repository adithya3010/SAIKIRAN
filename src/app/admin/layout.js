"use client";
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return children;
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
