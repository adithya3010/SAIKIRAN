"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { filters } from '@/lib/data';
import Image from 'next/image';

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'T-Shirt',
        fit: 'Regular',
        fabric: '',
        printType: 'Solid',
        occasion: 'Everyday',
        images: [''], // Array of URL strings
        // Extended Color Schema to include stock
        colors: [{ name: 'Black', hex: '#000000', stock: 10 }],
        sizes: [],
        variants: [], // { color, size, stock }
        inStock: true
    });

    // Auto-generate variants when colors or sizes change
    useEffect(() => {
        const newVariants = [];
        formData.colors.forEach(color => {
            formData.sizes.forEach(size => {
                // Check if variant already exists to preserve stock value
                const existing = formData.variants.find(v => v.color.name === color.name && v.size === size);
                newVariants.push({
                    color: { name: color.name, hex: color.hex },
                    size: size,
                    stock: existing ? existing.stock : 0
                });
            });
        });

        // Only update if dimensions changed (check length or key consistency)
        if (newVariants.length !== formData.variants.length) {
            setFormData(prev => ({ ...prev, variants: newVariants }));
        } else {
            const currentKeys = formData.variants.map(v => `${v.color.name}-${v.size}`).sort().join('|');
            const newKeys = newVariants.map(v => `${v.color.name}-${v.size}`).sort().join('|');
            if (currentKeys !== newKeys) {
                setFormData(prev => ({ ...prev, variants: newVariants }));
            }
        }

    }, [formData.colors, formData.sizes]);


    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (index, value, field) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (index, field) => {
        const newArray = [...formData[field]];
        newArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    // File Upload Handler
    const handleFileUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const result = await res.json();

            if (result.success) {
                // Update the images array at the specific index
                handleArrayChange(index, result.url, 'images');
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };


    // Color Handlers
    const handleColorChange = (index, field, value) => {
        const newColors = [...formData.colors];
        newColors[index][field] = value;
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    const addColor = () => {
        setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000', stock: 10 }] }));
    };

    const removeColor = (index) => {
        const newColors = [...formData.colors];
        newColors.splice(index, 1);
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    // Size Handlers
    const toggleSize = (size) => {
        setFormData(prev => {
            const newSizes = prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size];
            return { ...prev, sizes: newSizes };
        });
    };

    // Variant Stock Handler
    const handleVariantStockChange = (index, value) => {
        const newVariants = [...formData.variants];
        newVariants[index].stock = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Clean up data before sending
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                images: formData.images.filter(img => img.trim() !== ''),
                colors: formData.colors.filter(c => c.name.trim() !== '')
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            router.push('/admin/products');
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 md:p-12 pb-20 max-w-4xl mx-auto">
            <h1 className="text-4xl font-outfit font-bold uppercase mb-2 text-foreground">Add Product</h1>
            <p className="text-text-muted mb-10">Create a new item in your catalog.</p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">

                {/* Basic Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-border-primary pb-4 text-foreground">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                            >
                                {filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-text-muted">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                            required
                        ></textarea>
                    </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-border-primary pb-4 text-foreground">Pricing & Inventory</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                                required
                                min="0"
                            />
                        </div>
                        <div className="flex items-center gap-4 pt-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${formData.inStock ? 'bg-foreground border-foreground' : 'border-text-muted'}`}>
                                    {formData.inStock && <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="hidden" />
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:text-foreground transition-colors text-text-muted">In Stock</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-border-primary pb-4 text-foreground">Product Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Fit</label>
                            <select
                                name="fit"
                                value={formData.fit}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                            >
                                {filters.fits.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Fabric</label>
                            <input
                                type="text"
                                name="fabric"
                                value={formData.fabric}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                                placeholder="e.g. 100% Cotton"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Print Type</label>
                            <select
                                name="printType"
                                value={formData.printType}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                            >
                                {filters.printTypes.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-muted">Occasion</label>
                            <select
                                name="occasion"
                                value={formData.occasion}
                                onChange={handleChange}
                                className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none transition-colors"
                            >
                                {filters.occasions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-border-primary pb-4 text-foreground">Images</h2>
                    <p className="text-xs text-text-muted">Upload product images (Accepted: JPG, PNG, WEBP).</p>

                    {formData.images.map((url, index) => (
                        <div key={index} className="flex gap-4 items-center">
                            <div className="flex-1">
                                {!url ? (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(index, e)}
                                        className="w-full bg-bg-secondary border border-border-primary p-3 rounded text-foreground focus:border-foreground outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:opacity-90 transition-colors"
                                    />
                                ) : (
                                    <div className="flex items-center gap-4 bg-bg-secondary p-2 rounded border border-border-primary">
                                        <div className="relative w-16 h-16 bg-bg-tertiary rounded overflow-hidden">
                                            <Image src={url} alt="Preview" fill className="object-cover" />
                                        </div>
                                        <span className="text-xs text-text-muted truncate flex-1">{url}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleArrayChange(index, '', 'images')}
                                            className="text-foreground hover:text-red-400 text-xs uppercase underline p-2"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                            {formData.images.length > 1 && (
                                <button type="button" onClick={() => removeArrayItem(index, 'images')} className="text-red-500 hover:text-red-400 px-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            )}
                        </div>
                    ))}

                    {uploading && <p className="text-xs text-yellow-500 animate-pulse">Uploading...</p>}

                    <button type="button" onClick={() => addArrayItem('images')} className="text-xs font-bold uppercase tracking-widest text-foreground border-b border-foreground hover:text-text-muted hover:border-text-muted transition-colors">
                        + Add Another Image
                    </button>
                </div>

                {/* Variants Configuration */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b border-border-primary pb-4 text-foreground">Variants Configuration</h2>

                    {/* Step 1: Sizes */}
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest text-text-muted">1. Select Available Sizes</label>
                        <div className="flex flex-wrap gap-3">
                            {filters.sizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`w-12 h-12 rounded border flex items-center justify-center text-sm font-bold transition-all ${formData.sizes.includes(size)
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-transparent text-text-muted border-border-primary hover:border-foreground'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Colors */}
                    <div className="space-y-4 pt-4">
                        <label className="text-xs uppercase tracking-widest text-text-muted">2. Define Colors</label>
                        {formData.colors.map((color, index) => (
                            <div key={index} className="flex gap-4 items-end bg-bg-secondary p-4 rounded border border-border-primary">
                                <div className="space-y-2 flex-1">
                                    <label className="text-[10px] uppercase text-text-muted">Name</label>
                                    <input
                                        type="text"
                                        value={color.name}
                                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                        className="w-full bg-bg-tertiary border border-border-primary p-2 rounded text-foreground focus:border-foreground outline-none text-sm transition-colors"
                                        placeholder="e.g. Midnight Black"
                                    />
                                </div>
                                <div className="space-y-2 w-32">
                                    <label className="text-[10px] uppercase text-text-muted">Hex Code</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color.hex}
                                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-xs text-text-muted font-mono">{color.hex}</span>
                                    </div>
                                </div>
                                {formData.colors.length > 1 && (
                                    <button type="button" onClick={() => removeColor(index)} className="text-red-500 hover:text-red-400 px-3 pb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addColor} className="text-xs font-bold uppercase tracking-widest text-foreground border-b border-foreground hover:text-text-muted hover:border-text-muted transition-colors">
                            + Add Another Color
                        </button>
                    </div>

                    {/* Step 3: Stock Matrix */}
                    {formData.variants.length > 0 && (
                        <div className="space-y-4 pt-8 border-t border-border-primary">
                            <label className="text-xs uppercase tracking-widest text-text-muted">3. Manage Stock (SKU Level)</label>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-text-muted">
                                    <thead className="text-xs uppercase bg-bg-tertiary text-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Color</th>
                                            <th className="px-4 py-3">Size</th>
                                            <th className="px-4 py-3">Stock Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-primary">
                                        {formData.variants.map((variant, index) => (
                                            <tr key={`${variant.color.name}-${variant.size}-${index}`} className="hover:bg-bg-tertiary transition-colors">
                                                <td className="px-4 py-3 flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full border border-border-primary" style={{ backgroundColor: variant.color.hex }}></div>
                                                    {variant.color.name}
                                                </td>
                                                <td className="px-4 py-3 font-mono">{variant.size}</td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => handleVariantStockChange(index, e.target.value)}
                                                        className="w-24 bg-bg-tertiary border border-border-primary p-2 rounded text-foreground focus:border-foreground outline-none text-right transition-colors"
                                                        min="0"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Action */}
                <div className="pt-8 border-t border-border-primary flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-foreground text-background px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-foreground/90 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>

            </form>
        </div>
    );
}
