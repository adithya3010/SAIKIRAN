"use client";
import React, { useState } from 'react';
import { filters } from '@/lib/data';

const FilterSection = ({ title, children, isOpen: defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-white/10 py-6 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left group mb-4"
            >
                <span className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-grey-300 transition-colors">
                    {title}
                </span>
                <span className={`text-xl text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
            </button>
            <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    );
};

export default function FilterSidebar({ selectedFilters, handleFilterChange, priceRange, setPriceRange, clearFilters }) {

    // Helper to check if a value is selected
    const isSelected = (type, value) => selectedFilters[type]?.includes(value);

    // Handler for checkbox changes
    const onCheckboxChange = (type, value) => {
        const current = selectedFilters[type] || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        handleFilterChange(type, updated);
    };

    return (
        <div className="w-full pr-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-outfit font-bold uppercase text-white">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-xs text-grey-400 hover:text-white uppercase tracking-wider underline underline-offset-4 transition-colors"
                >
                    Clear All
                </button>
            </div>

            {/* Price Range */}
            <FilterSection title="Price">
                <div className="px-1">
                    <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-1 bg-grey-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-xs text-grey-400 mt-2 font-mono">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                </div>
            </FilterSection>

            {/* Category */}
            <FilterSection title="Category">
                {filters.categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border border-grey-600 rounded-sm flex items-center justify-center transition-colors ${isSelected('category', cat) ? 'bg-white border-white' : 'group-hover:border-grey-400'}`}>
                            {isSelected('category', cat) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className={`text-sm ${isSelected('category', cat) ? 'text-white' : 'text-grey-400 group-hover:text-grey-200'} transition-colors`}>{cat}</span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected('category', cat)}
                            onChange={() => onCheckboxChange('category', cat)}
                        />
                    </label>
                ))}
            </FilterSection>

            {/* Fit */}
            <FilterSection title="Fit">
                {filters.fits.map(fit => (
                    <label key={fit} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border border-grey-600 rounded-sm flex items-center justify-center transition-colors ${isSelected('fit', fit) ? 'bg-white border-white' : 'group-hover:border-grey-400'}`}>
                            {isSelected('fit', fit) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className={`text-sm ${isSelected('fit', fit) ? 'text-white' : 'text-grey-400 group-hover:text-grey-200'} transition-colors`}>{fit}</span>
                        <input type="checkbox" className="hidden" onChange={() => onCheckboxChange('fit', fit)} />
                    </label>
                ))}
            </FilterSection>

            {/* Fabric */}
            <FilterSection title="Fabric">
                {filters.fabrics.map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border border-grey-600 rounded-sm flex items-center justify-center transition-colors ${isSelected('fabric', opt) ? 'bg-white border-white' : 'group-hover:border-grey-400'}`}>
                            {isSelected('fabric', opt) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className={`text-sm ${isSelected('fabric', opt) ? 'text-white' : 'text-grey-400 group-hover:text-grey-200'} transition-colors`}>{opt}</span>
                        <input type="checkbox" className="hidden" onChange={() => onCheckboxChange('fabric', opt)} />
                    </label>
                ))}
            </FilterSection>

            {/* Occasion */}
            <FilterSection title="Occasion">
                {filters.occasions.map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border border-grey-600 rounded-sm flex items-center justify-center transition-colors ${isSelected('occasion', opt) ? 'bg-white border-white' : 'group-hover:border-grey-400'}`}>
                            {isSelected('occasion', opt) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className={`text-sm ${isSelected('occasion', opt) ? 'text-white' : 'text-grey-400 group-hover:text-grey-200'} transition-colors`}>{opt}</span>
                        <input type="checkbox" className="hidden" onChange={() => onCheckboxChange('occasion', opt)} />
                    </label>
                ))}
            </FilterSection>

            {/* Availability */}
            <FilterSection title="Availability">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border border-grey-600 rounded-sm flex items-center justify-center transition-colors ${selectedFilters.inStock ? 'bg-white border-white' : 'group-hover:border-grey-400'}`}>
                        {selectedFilters.inStock && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span className={`text-sm ${selectedFilters.inStock ? 'text-white' : 'text-grey-400 group-hover:text-grey-200'} transition-colors`}>In Stock Only</span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={!!selectedFilters.inStock}
                        onChange={() => handleFilterChange('inStock', !selectedFilters.inStock)}
                    />
                </label>
            </FilterSection>

        </div>
    );
}
