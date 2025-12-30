"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import { useCart } from '@/context/CartContext';
import SearchModal from '../search/SearchModal';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleCart, cartCount } = useCart();

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-[80px] z-[100] bg-black/80 backdrop-blur-xl border-b border-white/10 transition-transform duration-300">
                <div className="max-w-[1400px] mx-auto h-full px-4 grid grid-cols-[1fr_auto_1fr] items-center">
                    {/* Left (Desktop Nav) */}
                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex gap-8">
                            {['Men', 'Women', 'Collections'].map((item) => (
                                <Link key={item} href={item === 'Collections' ? '/collections' : `/shop/${item.toLowerCase()}`} className="text-sm uppercase tracking-wider text-grey-400 transition-colors hover:text-white">
                                    {item}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Left (Mobile Menu Toggle) */}
                    <div className="flex md:hidden justify-start">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white uppercase tracking-wider text-sm bg-transparent border-none p-2">
                            {isMenuOpen ? 'Close' : 'Menu'}
                        </button>
                    </div>

                    {/* Center (Logo) */}
                    <div className="flex justify-center">
                        <Link href="/" className="font-outfit text-2xl font-bold tracking-[0.1em] uppercase text-white">
                            KSHRA
                        </Link>
                    </div>

                    {/* Right (Actions) */}
                    <div className="flex justify-end items-center gap-6">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:block bg-transparent border-none text-white text-sm uppercase tracking-wider cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                        >
                            Search
                        </button>
                        <button className="hidden md:block bg-transparent border-none text-white text-sm uppercase tracking-wider cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                            Account
                        </button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={toggleCart}>
                            Cart ({cartCount})
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed top-[80px] left-0 w-full h-[calc(100vh-80px)] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden overflow-y-auto pb-20">
                        <nav className="flex flex-col items-center gap-8">
                            {['Men', 'Women', 'Collections', 'Search', 'Account'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Collections' ? '/collections' : ['Search', 'Account'].includes(item) ? '#' : `/shop/${item.toLowerCase()}`}
                                    className="text-3xl uppercase tracking-wider text-white font-medium hover:text-grey-400 transition-colors"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        if (item === 'Search') setIsSearchOpen(true);
                                    }}
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
