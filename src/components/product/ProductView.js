"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductActions from './ProductActions';
import Accordion from '@/components/ui/Accordion';
import ProductGrid from '@/components/product/ProductGrid';

export default function ProductView({ product, recommendedProducts }) {
    // Determine initial color (first one or default)
    const initialColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [activeImage, setActiveImage] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const [inlineCarouselEl, setInlineCarouselEl] = useState(null);
    const [fullscreenCarouselEl, setFullscreenCarouselEl] = useState(null);

    // Update active image when color changes
    useEffect(() => {
        if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
            setActiveImage(selectedColor.images[0]);
            setActiveIndex(0);
        } else if (product.images && product.images.length > 0) {
            // Fallback to top-level images if no specific color images
            setActiveImage(product.images[0]);
            setActiveIndex(0);
        } else {
            setActiveImage(null);
            setActiveIndex(0);
        }
    }, [selectedColor, product.images]);

    // Gather all images to show:
    // If selectedColor has images, show them.
    // If not, or if fallback needed, could show product.images?
    // Let's strictly show color images if they exist, otherwise top-level.
    const currentImages = (selectedColor?.images && selectedColor.images.length > 0)
        ? selectedColor.images
        : product.images;

    const clampIndex = (idx) => {
        const len = Array.isArray(currentImages) ? currentImages.length : 0;
        if (len <= 0) return 0;
        return Math.max(0, Math.min(len - 1, idx));
    };

    const goToIndex = (nextIdx) => {
        if (!Array.isArray(currentImages) || currentImages.length === 0) return;
        const idx = clampIndex(nextIdx);
        setActiveIndex(idx);
        setActiveImage(currentImages[idx]);

        const scrollTargets = [inlineCarouselEl, fullscreenCarouselEl].filter(Boolean);
        if (scrollTargets.length === 0) return;

        setIsAnimating(true);
        for (const el of scrollTargets) {
            const slide = el.querySelector(`[data-slide-index="${idx}"]`);
            if (slide && typeof slide.scrollIntoView === 'function') {
                slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }
        }
        window.setTimeout(() => setIsAnimating(false), 250);
    };

    const handleCarouselScroll = (e) => {
        if (isAnimating) return;
        const el = e.currentTarget;
        const width = el.clientWidth;
        if (!width) return;
        const idx = clampIndex(Math.round(el.scrollLeft / width));
        if (idx !== activeIndex) {
            setActiveIndex(idx);
            if (Array.isArray(currentImages) && currentImages[idx]) {
                setActiveImage(currentImages[idx]);
            }
        }
    };

    const handleMainImageClick = () => {
        if (typeof window === 'undefined') return;
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) setIsFullscreen(true);
    };

    // Lock background scroll while fullscreen viewer is open
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (!isFullscreen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isFullscreen]);

    // Ensure fullscreen viewer opens at the current slide
    useEffect(() => {
        if (!isFullscreen) return;
        if (!fullscreenCarouselEl) return;
        const slide = fullscreenCarouselEl.querySelector(`[data-slide-index="${activeIndex}"]`);
        if (slide && typeof slide.scrollIntoView === 'function') {
            slide.scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
        }
    }, [isFullscreen, fullscreenCarouselEl, activeIndex]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left: Images (Grid or Slider) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="relative w-full">
                        <div
                            ref={setInlineCarouselEl}
                            onScroll={handleCarouselScroll}
                            onClick={handleMainImageClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') handleMainImageClick();
                            }}
                            className="aspect-[3/4] w-full bg-bg-secondary overflow-hidden rounded-lg flex snap-x snap-mandatory overflow-x-auto no-scrollbar scroll-smooth"
                        >
                            {Array.isArray(currentImages) && currentImages.length > 0 ? (
                                currentImages.map((img, idx) => (
                                    <div
                                        key={`${img}-${idx}`}
                                        data-slide-index={idx}
                                        className="relative w-full h-full flex-none snap-start"
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            fill
                                            sizes="(min-width: 1024px) 58vw, 100vw"
                                            className="object-cover"
                                            priority={idx === 0}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                            )}
                        </div>
                    </div>
                    {/* Thumbnails / Secondary Images */}
                    {currentImages && currentImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {currentImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToIndex(idx)}
                                    className={`aspect-[3/4] relative bg-bg-secondary rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-foreground' : 'border-transparent hover:border-border-primary'
                                        }`}
                                >
                                    <Image src={img} alt={`${product.name} ${idx}`} fill sizes="25vw" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Details (Sticky) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-[100px]">

                        {/* Product Actions Component */}
                        <ProductActions
                            product={product}
                            selectedColor={selectedColor}
                            setSelectedColor={setSelectedColor}
                        />

                        {/* Accordions */}
                        <div className="mt-8 border-t border-border-primary">
                            <Accordion title="Description" defaultOpen={true}>
                                <p className="text-foreground/80 leading-relaxed">{product.description}</p>
                                <ul className="mt-4 list-disc list-inside space-y-1 text-xs text-text-muted">
                                    <li>Fabric: {product.fabric}</li>
                                    <li>Fit: {product.fit}</li>
                                    <li>Occasion: {product.occasion}</li>
                                </ul>
                            </Accordion>
                            <Accordion title="Manufacturer Details">
                                <p className="text-foreground/80">Made in India.</p>
                                <p className="text-foreground/80">Marketed by KSHRA Inc.</p>
                            </Accordion>
                            <Accordion title="Shipping, Return and Exchange">
                                <p className="text-foreground/80">Free shipping on all prepaid orders.</p>
                                <p className="text-foreground/80">7-day easy return and exchange policy.</p>
                            </Accordion>
                        </div>

                    </div>
                </div>
            </div>

            {/* Recommended Section */}
            <div className="mt-32">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-10">Recommended</h3>
                <ProductGrid products={recommendedProducts} title="" />
            </div>

            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black">
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(false)}
                        aria-label="Close"
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center"
                    >
                        <span className="text-2xl leading-none">×</span>
                    </button>

                    <div
                        ref={setFullscreenCarouselEl}
                        onScroll={handleCarouselScroll}
                        className="h-full w-full overflow-x-auto no-scrollbar flex snap-x snap-mandatory scroll-smooth"
                    >
                        {Array.isArray(currentImages) && currentImages.length > 0 ? (
                            currentImages.map((img, idx) => (
                                <div
                                    key={`fs-${img}-${idx}`}
                                    data-slide-index={idx}
                                    className="relative w-full h-full flex-none snap-start"
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} fullscreen ${idx + 1}`}
                                        fill
                                        sizes="100vw"
                                        className="object-contain"
                                        priority={idx === 0}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/80">No Image</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
