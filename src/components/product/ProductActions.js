"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Button from '../ui/Button';

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    // Default val needed for hydration if logic depends on props
    const [isClient, setIsClient] = useState(false);

    // Default to first available option if possible
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
    const [quantity, setQuantity] = useState(1);

    // Pincode State
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState(null);

    // Error State
    const [error, setError] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (selectedSize) setError('');
    }, [selectedSize]);

    // Find Active Variant Logic
    const getActiveVariant = () => {
        if (!selectedSize || !selectedColor) return null;
        return product.variants?.find(v =>
            v.size === selectedSize &&
            v.color.name === selectedColor.name
        );
    };

    const activeVariant = getActiveVariant();

    // Stock Logic
    let currentStock = 0;
    if (product.variants?.length > 0) {
        if (activeVariant) {
            currentStock = activeVariant.stock;
        } else {
            // Pending selection
            currentStock = -1; // Unknown
        }
    } else {
        // Fallback for legacy products
        currentStock = product.inStock ? 99 : 0;
    }

    const isOutOfStock = currentStock === 0;

    // reset Quantity if it exceeds new stock limit when size/color changes
    useEffect(() => {
        if (currentStock > 0 && quantity > currentStock) {
            setQuantity(currentStock);
        }
    }, [currentStock, quantity]);


    const handleQuantityChange = (delta) => {
        setQuantity(prev => {
            const newVal = prev + delta;
            // Min 1
            if (newVal < 1) return 1;
            // Max currentStock (if known and positive)
            if (currentStock > 0 && newVal > currentStock) return currentStock;
            return newVal;
        });
    };

    const handleCheckPincode = (e) => {
        e.preventDefault();
        if (pincode.length === 6 && /^\d+$/.test(pincode)) {
            setPincodeStatus({ type: 'success', msg: `Delivery by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` });
        } else {
            setPincodeStatus({ type: 'error', msg: 'Invalid Pincode' });
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize && product.sizes?.length > 0) {
            setError('Please select a size to proceed');
            return;
        }
        if (isOutOfStock) return;

        if (currentStock > 0 && quantity > currentStock) {
            setError(`Only ${currentStock} left in stock!`);
            return;
        }

        addToCart({
            ...product,
            selectedSize,
            selectedColor: selectedColor || product.colors?.[0] || { name: 'Default', hex: '#000000' },
            quantity
        });

        // Visual feedback could go here (e.g. "Added!")
    };

    const handleBuyNow = () => {
        if (!selectedSize && product.sizes?.length > 0) {
            setError('Please select a size to proceed');
            return;
        }
        // ... (Buy Now Logic)
        handleAddToCart(); // For now just add to cart and maybe redirect
    };

    // Fake MRP for visuals
    const mrp = Math.round(product.price * 1.45);
    const discount = Math.round(((mrp - product.price) / mrp) * 100);

    return (
        <div className="space-y-8">
            {/* Price Block */}
            <div>
                <h3 className="text-xs uppercase tracking-widest text-text-muted mb-1">
                    {product.fit} Fit {product.printType} {product.category}
                </h3>
                <h2 className="font-outfit text-2xl font-bold uppercase text-foreground mb-2">
                    {product.name}
                </h2>
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                    <span className="text-text-muted line-through text-sm">₹{mrp.toLocaleString()}</span>
                    <span className="text-red-400 text-xs font-bold tracking-widest">{discount}% OFF</span>
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">(Incl. of all taxes)</p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Select Color: <span className="text-foreground">{selectedColor?.name}</span></span>
                    </div>
                    <div className="flex gap-3">
                        {product.colors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor?.name === color.name ? 'border-foreground' : 'border-transparent hover:border-border-secondary'
                                    }`}
                                title={color.name}
                            >
                                <div className="w-6 h-6 rounded-full border border-border-primary" style={{ backgroundColor: color.hex }}></div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold uppercase tracking-widest ${error ? 'text-red-500' : 'text-text-muted'}`}>
                            Select Size {error && <span className="normal-case ml-2">- {error}</span>}
                        </span>
                        <button className="text-[10px] underline text-text-muted hover:text-foreground">Size Guide</button>
                    </div>
                    <div className={`flex flex-wrap gap-3 ${error ? 'animate-shake' : ''}`}>
                        {product.sizes.map((size) => {
                            return (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-10 border text-sm font-medium transition-all ${selectedSize === size
                                        ? 'border-foreground bg-foreground text-background'
                                        : error
                                            ? 'border-red-500 text-red-400 hover:border-red-400'
                                            : 'border-border-primary text-text-muted hover:border-border-secondary'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stock Status Indicator */}
            {selectedSize && selectedColor && isClient && (
                <div className="text-xs uppercase tracking-widest font-bold h-4">
                    {activeVariant ? (
                        currentStock > 0 ? (
                            currentStock <= 5 ? (
                                <span className="text-red-500">Only {currentStock} left!</span>
                            ) : currentStock <= 10 ? (
                                <span className="text-orange-400">Only a few left</span>
                            ) : (
                                <span className="text-green-400">In Stock</span>
                            )
                        ) : (
                            <span className="text-red-500">Out of Stock</span>
                        )
                    ) : (
                        // Fallback for no variant match or legacy
                        product.variants?.length ? <span className="text-red-500">Unavailable</span> : <span className="text-green-400">Available</span>
                    )}
                </div>
            )}


            {/* Quantity Selector */}
            <div className={`flex items-center gap-4 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Quantity</span>
                <div className="flex items-center border border-border-primary h-10">
                    <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-bg-tertiary transition-colors"
                        disabled={quantity <= 1}
                    >
                        -
                    </button>
                    <div className="w-10 h-full flex items-center justify-center text-sm font-bold text-foreground border-x border-border-primary">
                        {quantity}
                    </div>
                    <button
                        onClick={() => handleQuantityChange(1)}
                        className={`w-10 h-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-bg-tertiary transition-colors ${
                            // Disable plus if at stock limit
                            (currentStock > 0 && quantity >= currentStock) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={currentStock > 0 && quantity >= currentStock}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Payment & Pincode */}
            <div className="space-y-4 pt-4 border-t border-dashed border-border-primary">
                
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-4 pb-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`border-foreground hover:bg-foreground hover:text-white dark:hover:text-black uppercase tracking-widest font-bold text-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''} text-foreground transition-colors`}
                >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </Button>
                <Button
                    variant="solid"
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`uppercase tracking-widest font-bold text-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'animate-shake' : ''} bg-foreground text-background hover:opacity-90`}
                >
                    Buy It Now
                </Button>
            </div>

            {/* Pincode & Trust (Rest of UI) */}
            <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Check Estimated Delivery</span>
                <form onSubmit={handleCheckPincode} className="flex h-12">
                    <input
                        type="text"
                        placeholder="Enter your pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="flex-1 bg-bg-secondary border border-border-primary px-4 text-sm text-foreground placeholder-text-muted focus:outline-none focus:border-border-secondary transition-colors"
                        maxLength="6"
                    />
                    <button type="submit" className="bg-foreground text-background border border-l-0 border-border-primary px-6 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Check
                    </button>
                </form>
                {pincodeStatus && (
                    <p className={`text-xs ${pincodeStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {pincodeStatus.msg}
                    </p>
                )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-y-4 text-[10px] text-text-muted uppercase tracking-wide pt-4 border-t border-border-primary">
                <div className="flex items-center gap-2"><span>• 100% Original</span></div>
                <div className="flex items-center gap-2"><span>• Pay on delivery</span></div>
                <div className="flex items-center gap-2"><span>• Easy Returns</span></div>
                <div className="flex items-center gap-2"><span>• Secure Payments</span></div>
            </div>

        </div>
    );
}
