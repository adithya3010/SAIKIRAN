"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);

    const hasVariantStock = Array.isArray(product.variants) && product.variants.length > 0;
    const isSoldOut = hasVariantStock
        ? !product.variants.some(v => (v?.stock || 0) > 0)
        : !product.inStock;

    const firstColorImages = product?.colors?.[0]?.images;
    const imageList = (Array.isArray(firstColorImages) && firstColorImages.length > 0)
        ? firstColorImages
        : product.images;

    // Provide fallback images if array is empty or short
    const mainImage = imageList?.[0] || '/placeholder.png'; // You might want a real placeholder
    const hoverImage = imageList?.[1] || mainImage;

    return (
        <div
            className="group relative flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <Link href={`/product/${product.id}`} className="relative w-full aspect-[3/4] bg-grey-900 overflow-hidden mb-4">
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className={`object-cover object-center transition-opacity duration-500 ease-in-out ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />
                <Image
                    src={hoverImage}
                    alt={`${product.name} alternate view`}
                    fill
                    className={`object-cover object-center transition-opacity duration-500 ease-in-out absolute inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNewProduct && (
                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            New
                        </span>
                    )}
                    {isSoldOut && (
                        <span className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Quick Add (Optional/Future) */}
                <div className={`absolute bottom-0 left-0 w-full bg-white/10 backdrop-blur-md p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex items-center justify-center`}>
                    <span className="text-white text-xs uppercase tracking-widest font-bold">Quick View</span>
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <Link href={`/product/${product.id}`}>
                        <h3 className="text-sm md:text-base font-outfit uppercase tracking-wide text-white group-hover:text-grey-300 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="text-sm font-medium text-grey-400">₹{product.price.toLocaleString('en-IN')}</p>
                </div>

                {/* Color Dots */}
                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-2 mt-1">
                        {product.colors.map((color, index) => (
                            <div
                                key={index}
                                className="w-3 h-3 rounded-full border border-grey-800"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}

                {/* Size Range (Optional) */}
                <div className="text-[10px] text-grey-600 uppercase tracking-wider mt-1">
                    {product.sizes?.join(' · ')}
                </div>
            </div>
        </div>
    );
}
