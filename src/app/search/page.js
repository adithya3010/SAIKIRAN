"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { products } from '@/lib/data';
import FilterSidebar from '@/components/search/FilterSidebar';
import FilterDrawer from '@/components/search/FilterDrawer';
import ProductCard from '@/components/product/ProductCard';

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    // UI State
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [localQuery, setLocalQuery] = useState(query);

    // Sync local input with URL query
    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    // Handle Search Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (localQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(localQuery)}`);
        } else {
            router.push('/search'); // If query is cleared, navigate to base search page
        }
    };

    // Filter State
    const [selectedFilters, setSelectedFilters] = useState({
        category: [],
        fit: [],
        fabric: [],
        occasion: [],
        inStock: false
    });
    const [priceRange, setPriceRange] = useState([0, 20000]);
    const [sortBy, setSortBy] = useState('newest');

    // Filtered Products State
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Handler for updating filters
    const handleFilterChange = (type, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    // (Re-declaring clearFilters to NOT clear query based on typical e-commerce UX, or maybe just the side filters)
    const clearSideFilters = () => {
        setSelectedFilters({
            category: [],
            fit: [],
            fabric: [],
            occasion: [],
            inStock: false
        });
        setPriceRange([0, 20000]);
    }

    // Filtering Logic
    useEffect(() => {
        let results = products.filter(product => {
            // 1. Search Query
            if (query) {
                const searchLower = query.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchLower);
                const matchesCategory = product.category.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesCategory) return false;
            }

            // 2. Price Range
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

            // 3. Categories
            if (selectedFilters.category.length > 0 && !selectedFilters.category.includes(product.category)) return false;

            // 4. Fit
            if (selectedFilters.fit.length > 0 && !selectedFilters.fit.includes(product.fit)) return false;

            // 5. Fabric
            if (selectedFilters.fabric.length > 0 && !selectedFilters.fabric.includes(product.fabric)) return false;

            // 6. Occasion
            if (selectedFilters.occasion.length > 0 && !selectedFilters.occasion.includes(product.occasion)) return false;

            // 7. Stock
            if (selectedFilters.inStock && !product.inStock) return false;

            return true;
        });

        // Sorting
        results.sort((a, b) => {
            if (sortBy === 'price-low-high') return a.price - b.price;
            if (sortBy === 'price-high-low') return b.price - a.price;
            if (sortBy === 'newest') return b.isNew ? 1 : -1;
            return 0;
        });

        setFilteredProducts(results);
    }, [query, selectedFilters, priceRange, sortBy]);


    return (
        <div className="min-h-screen bg-black text-white">

            {/* Page Header (Search Bar & Breadcrumbs) */}
            <div className="border-b border-white/10 bg-neutral-900/50">
                <div className="container-custom py-8 md:py-10">

                    {/* Search Input Form */}
                    <form onSubmit={handleSearchSubmit} className="max-w-3xl mb-6">
                        <div className="relative group">
                            <input
                                type="text"
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                placeholder="Search products, categories, styles..."
                                className="w-full bg-transparent border-b-2 border-grey-700 text-3xl md:text-5xl font-outfit font-bold text-white placeholder-grey-700 focus:outline-none focus:border-white pb-2 transition-colors uppercase tracking-tight"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 bottom-4 text-grey-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center gap-4 text-grey-400 text-sm">
                        <span>{filteredProducts.length} Results Found</span>
                        {query && (
                            <>
                                <span className="w-1 h-1 bg-grey-600 rounded-full"></span>
                                <span>For "{query}"</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
                        <FilterSidebar
                            selectedFilters={selectedFilters}
                            handleFilterChange={handleFilterChange}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            clearFilters={clearSideFilters}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">

                        {/* Mobile Filter Trigger & Sort */}
                        <div className="flex justify-between items-center mb-6 lg:mb-8 sticky top-[80px] z-30 bg-black py-4 lg:static lg:bg-transparent lg:py-0">
                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                                Filter
                            </button>

                            <div className="flex items-center gap-3 ml-auto">
                                <span className="text-grey-500 text-xs uppercase tracking-widest hidden md:inline">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-white border-none md:border text-sm font-bold uppercase focus:outline-none cursor-pointer"
                                >
                                    <option value="newest" className="bg-black">Newest</option>
                                    <option value="price-low-high" className="bg-black">Price: Low to High</option>
                                    <option value="price-high-low" className="bg-black">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border border-white/10 rounded-lg p-12">
                                <p className="text-xl md:text-2xl text-grey-500 mb-6 font-light">No products match your criteria.</p>
                                <button
                                    onClick={clearSideFilters}
                                    className="text-white border-b border-white hover:text-grey-300 hover:border-grey-300 transition-colors uppercase tracking-widest text-sm pb-1"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <FilterDrawer
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                selectedFilters={selectedFilters}
                handleFilterChange={handleFilterChange}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                clearFilters={clearSideFilters}
            />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
