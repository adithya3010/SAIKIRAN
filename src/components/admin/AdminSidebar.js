"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const NavItem = ({ href, label, icon: Icon }) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-white text-black font-medium'
                : 'text-grey-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-black' : 'stroke-current'}`} />
            <span className="uppercase tracking-wide text-xs md:text-sm">{label}</span>
        </Link>
    );
};

// Icons (Simple SVGs)
const DashboardIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ProductIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const UsersIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const OrderIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const HeroIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const SettingsIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default function AdminSidebar() {
    return (
        <div className="w-64 h-screen bg-background border-r border-border-secondary flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-colors duration-300">
            {/* Brand */}
            <div className="p-8 border-b border-border-secondary">
                <Link href="/" className="block relative w-32 h-16">
                    <Image
                        src="/brand.png"
                        alt="MAY BE NOT"
                        fill
                        className="object-contain object-left dark:invert"
                    />
                </Link>
                <div className="mt-2 text-xs font-mono text-text-muted uppercase">Admin Console</div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-2">
                <NavItem href="/admin/dashboard" label="Dashboard" icon={DashboardIcon} />
                <NavItem href="/admin/products" label="Products" icon={ProductIcon} />
                <NavItem href="/admin/orders" label="Orders" icon={OrderIcon} />
                <NavItem href="/admin/hero" label="Hero Sections" icon={HeroIcon} />
                <NavItem href="/admin/users" label="Customers" icon={UsersIcon} />
                <NavItem href="/admin/settings" label="Settings" icon={SettingsIcon} />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border-secondary">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-bg-tertiary rounded-full flex items-center justify-center text-xs font-bold text-foreground">AD</div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">Admin User</p>
                        <p className="text-xs text-text-muted truncate">admin@maybenot.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
