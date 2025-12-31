"use client";
import React, { useEffect } from 'react';
import FilterSidebar from './FilterSidebar';

export default function FilterDrawer({ isOpen, onClose, ...props }) {

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute bottom-0 left-0 w-full h-[85vh] bg-neutral-900 rounded-t-3xl shadow-2xl transform transition-transform duration-300 animate-slideUp flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-outfit font-bold uppercase text-white">Filters</h2>
                    <button onClick={onClose} className="p-2 text-white hover:text-grey-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <FilterSidebar {...props} />
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-neutral-900">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-grey-200 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
