"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
    const [isLoading, setIsLoading] = useState(true);

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

    // Fetch Products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Construct API URL with params
                const params = new URLSearchParams();
                if (query) params.append('search', query);
                params.append('sort', sortBy);

                // Note: The API currently supports basic Search & Sort. 
                // Complex filters (category array, price range) might need more advanced API logic 
                // or we can filter client-side after fetching matching search results. 
                // For MVP, let's fetch based on query/sort and filter the rest client side if API is limited,
                // OR ideally send specific filters. 
                // The current API implementation supports 'category' as single string.
                // We'll fetch results matching 'search' and 'sort' from DB, 
                // and then apply specific facet filters (fit, fabric, etc) client-side 
                // to avoid building a massive query builder right now unless requested.

                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();

                if (data.success) {
                    let results = data.data.map(p => ({ ...p, id: p._id }));

                    // Client-side Post-Filtering for facets not yet in API
                    // 1. Price Range
                    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

                    // 2. Categories (Multiselect)
                    if (selectedFilters.category.length > 0) {
                        results = results.filter(p => selectedFilters.category.includes(p.category));
                    }

                    // 3. Fit
                    if (selectedFilters.fit.length > 0) {
                        results = results.filter(p => selectedFilters.fit.includes(p.fit));
                    }

                    // 4. Fabric
                    if (selectedFilters.fabric.length > 0) {
                        results = results.filter(p => selectedFilters.fabric.includes(p.fabric));
                    }

                    // 5. Occasion
                    if (selectedFilters.occasion.length > 0) {
                        results = results.filter(p => selectedFilters.occasion.includes(p.occasion));
                    }

                    // 6. Stock
                    if (selectedFilters.inStock) {
                        results = results.filter(p => p.inStock);
                    }

                    setFilteredProducts(results);
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchProducts();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);

    }, [query, selectedFilters, priceRange, sortBy]);


    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Page Header (Search Bar & Breadcrumbs) */}
            <div className="border-b border-border-primary/10 bg-bg-secondary/50">
                <div className="container-custom py-8 md:py-10">

                    {/* Search Input Form */}
                    <form onSubmit={handleSearchSubmit} className="max-w-3xl mb-6">
                        <div className="relative group">
                            <input
                                type="text"
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                placeholder="Search products, categories, styles..."
                                className="w-full bg-transparent border-b-2 border-border-secondary text-3xl md:text-5xl font-outfit font-bold text-foreground placeholder-text-muted focus:outline-none focus:border-foreground pb-2 transition-colors uppercase tracking-tight"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 bottom-4 text-text-muted hover:text-foreground transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center gap-4 text-text-muted text-sm">
                        <span>{filteredProducts.length} Results Found</span>
                        {query && (
                            <>
                                <span className="w-1 h-1 bg-text-muted rounded-full"></span>
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
                        <div className="flex justify-between items-center mb-6 lg:mb-8 sticky top-[80px] z-30 bg-background py-4 lg:static lg:bg-transparent lg:py-0 transition-colors">
                            <button
                                onClick={() => setIsMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest border border-border-primary px-4 py-2 rounded-full hover:bg-foreground hover:text-background transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                                Filter
                            </button>

                            <div className="flex items-center gap-3 ml-auto">
                                <span className="text-text-muted text-xs uppercase tracking-widest hidden md:inline">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-foreground border-none md:border md:border-border-primary text-sm font-bold uppercase focus:outline-none cursor-pointer p-1"
                                >
                                    <option value="newest" className="bg-background text-foreground">Newest</option>
                                    <option value="price-low-high" className="bg-background text-foreground">Price: Low to High</option>
                                    <option value="price-high-low" className="bg-background text-foreground">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {isLoading ? (
                            <div className="min-h-[40vh] flex items-center justify-center text-text-muted">
                                Loading...
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id || product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border border-border-primary rounded-lg p-12">
                                <p className="text-xl md:text-2xl text-text-muted mb-6 font-light">No products match your criteria.</p>
                                <button
                                    onClick={clearSideFilters}
                                    className="text-foreground border-b border-foreground hover:text-text-muted hover:border-text-muted transition-colors uppercase tracking-widest text-sm pb-1"
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

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
