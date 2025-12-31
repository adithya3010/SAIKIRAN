"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';

export default function SearchModal({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);

    const router = useRouter();
    const [suggestions, setSuggestions] = useState([]);

    const handleSearch = (term) => {
        if (!term.trim()) return;
        onClose();
        router.push(`/search?q=${encodeURIComponent(term)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(searchTerm);
        }
        if (e.key === 'Escape') onClose();
    };

    // Auto-suggest logic
    useEffect(() => {
        if (searchTerm.trim().length > 1) {
            const matches = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 5);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="max-w-[800px] mx-auto p-4 md:p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 md:mb-12">
                    <p className="text-grey-500 text-xs md:text-sm uppercase tracking-widest font-bold">Search Store</p>
                    <button onClick={onClose} className="text-white hover:text-grey-400 transition-colors uppercase tracking-widest text-xs md:text-sm font-bold">
                        Close [ESC]
                    </button>
                </div>

                {/* Input */}
                <div className="relative mb-8 md:mb-12">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search by style, color, fit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-b border-grey-800 text-2xl md:text-4xl lg:text-5xl font-outfit font-bold text-white placeholder-grey-800 focus:outline-none focus:border-white pb-4 transition-colors uppercase"
                    />
                </div>

                {/* Suggestions / Popular */}
                <div className="flex-1 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        <div className="space-y-6">
                            <p className="text-grey-600 text-xs uppercase tracking-widest font-bold">Suggestions</p>
                            <div className="flex flex-col gap-4">
                                {suggestions.map(product => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="relative w-12 h-16 bg-grey-900 flex-shrink-0">
                                            {product.images[0] && (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-white text-lg font-outfit uppercase group-hover:text-grey-300 transition-colors">{product.name}</h4>
                                            <p className="text-grey-500 text-sm">₹{product.price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Popular Searches */}
                            <div>
                                <p className="text-grey-600 text-xs uppercase tracking-widest font-bold mb-4">Trending Now</p>
                                <div className="flex flex-wrap gap-3">
                                    {['Oversized Tees', 'Bomber Jackets', 'Cargo Pants', 'Graphic Print'].map(term => (
                                        <button
                                            key={term}
                                            onClick={() => handleSearch(term)}
                                            className="px-4 py-2 border border-grey-800 rounded-full text-grey-300 hover:border-white hover:text-white transition-all text-sm uppercase tracking-wide"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
