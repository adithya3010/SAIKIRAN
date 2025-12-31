"use client";
import React, { useState } from 'react';

export default function Accordion({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-grey-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left group"
            >
                <span className="text-xs font-bold uppercase tracking-widest text-grey-300 group-hover:text-white transition-colors">
                    {title}
                </span>
                <span className={`text-grey-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="text-sm text-grey-400 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
