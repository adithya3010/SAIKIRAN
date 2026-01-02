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

    // Update active image when color changes
    useEffect(() => {
        if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
            setActiveImage(selectedColor.images[0]);
        } else if (product.images && product.images.length > 0) {
            // Fallback to top-level images if no specific color images
            setActiveImage(product.images[0]);
        } else {
            setActiveImage(null);
        }
    }, [selectedColor, product.images]);

    // Gather all images to show:
    // If selectedColor has images, show them.
    // If not, or if fallback needed, could show product.images?
    // Let's strictly show color images if they exist, otherwise top-level.
    const currentImages = (selectedColor?.images && selectedColor.images.length > 0)
        ? selectedColor.images
        : product.images;

    return (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left: Images (Grid or Slider) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="aspect-[3/4] relative w-full bg-bg-secondary overflow-hidden rounded-lg">
                        {activeImage ? (
                            <Image
                                src={activeImage}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 hover:scale-105"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                        )}
                    </div>
                    {/* Thumbnails / Secondary Images */}
                    {currentImages && currentImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {currentImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`aspect-[3/4] relative bg-bg-secondary rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-foreground' : 'border-transparent hover:border-border-primary'
                                        }`}
                                >
                                    <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
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
        </div>
    );
}
