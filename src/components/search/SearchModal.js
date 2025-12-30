"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/lib/data';

export default function SearchModal({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    // Filter products
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filtered);
    }, [searchTerm]);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="max-w-[1000px] mx-auto p-4 md:p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-grey-400 text-sm uppercase tracking-widest">Search</p>
                    <button onClick={onClose} className="text-white hover:text-grey-400 transition-colors uppercase tracking-widest text-sm">
                        Close
                    </button>
                </div>

                {/* Input */}
                <div className="relative mb-12">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="SEARCH PRODUCTS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-b border-grey-700 text-3xl md:text-5xl font-outfit font-medium text-white placeholder-grey-700 focus:outline-none focus:border-white pb-4 transition-colors uppercase"
                    />
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                            {results.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={onClose}
                                    className="group flex gap-4 items-center"
                                >
                                    <div className="relative w-20 aspect-[3/4] bg-grey-800 flex-shrink-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-grey-700 to-black group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-outfit uppercase tracking-wide group-hover:text-grey-300 transition-colors">{product.name}</h4>
                                        <p className="text-grey-500 text-sm">₹{product.price.toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : searchTerm !== '' ? (
                        <p className="text-grey-500">No results found for "{searchTerm}"</p>
                    ) : (
                        <div className="hidden md:block">
                            <p className="text-grey-600 text-sm uppercase tracking-widest mb-4">Popular Searches</p>
                            <div className="flex gap-4">
                                {['Bomber', 'T-Shirt', 'Accessories', 'Women'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchTerm(term)}
                                        className="text-white hover:text-grey-400 transition-colors text-lg"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
