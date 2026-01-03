"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import SearchModal from '../search/SearchModal';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const ShoppingBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);

export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleCart, cartCount } = useCart();
    const { data: session } = useSession();

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-[80px] z-[100] bg-background/80 backdrop-blur-xl border-b border-border-primary/10 transition-colors duration-300">
                <div className="w-full h-full pl-0 pr-4 flex justify-between items-center">

                    {/* Left (Logo) */}
                    <div className="flex items-center">
                        <Link href="/" className="relative w-64 h-38 md:w-64 md:h-36 left-2 bottom-2">
                            <Image
                                src="/brand.png"
                                alt="MAY BE NOT"
                                fill
                                className="object-contain object-left dark:invert"
                                unoptimized
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right (Actions) */}
                    <div className="flex items-center gap-5 md:gap-8">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-foreground hover:text-foreground-secondary transition-colors"
                            aria-label="Search"
                        >
                            <SearchIcon />
                        </button>

                        <Link
                            href={session ? (session.user.role === 'admin' ? "/admin/dashboard" : "/account") : "/login"}
                            className="text-foreground hover:text-foreground-secondary transition-colors"
                            aria-label="Account"
                        >
                            <UserIcon />
                        </Link>

                        <button
                            onClick={toggleCart}
                            className="relative text-foreground hover:text-foreground-secondary transition-colors"
                            aria-label="Cart"
                        >
                            <ShoppingBagIcon />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
