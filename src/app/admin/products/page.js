"use client";
import React, { useState, useEffect } from 'react';
// import { products } from '@/lib/data'; // Removed static import
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProductsPage() {
    // Local state for search
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== id));
            } else {
                alert('Failed to delete product: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-outfit font-bold uppercase mb-2 text-foreground">Products</h1>
                    <p className="text-text-muted">Manage your store inventory.</p>
                </div>
                <Link
                    href="/admin/products/add"
                    className="bg-foreground text-background hover:bg-foreground/90 transition-colors px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Product
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-bg-secondary border border-border-primary rounded-t-xl p-4 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-tertiary border border-transparent focus:border-border-secondary text-foreground pl-10 pr-4 py-2 rounded-lg outline-none text-sm transition-colors placeholder-text-muted"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-bg-secondary border border-t-0 border-border-primary rounded-b-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-tertiary text-text-muted uppercase tracking-wider text-xs font-bold">
                            <tr>
                                <th className="p-4 w-20">Image</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-primary">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted">Loading products...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-muted">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product._id} className="hover:bg-bg-tertiary transition-colors group">
                                        <td className="p-4">
                                            <div className="relative w-12 h-16 bg-bg-tertiary rounded overflow-hidden">
                                                {/* Placeholder Image Logic */}
                                                {product.images && product.images[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-foreground">{product.name}</td>
                                        <td className="p-4 text-text-muted">{product.category}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${product.inStock
                                                ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                                : 'border-red-500/30 text-red-500 bg-red-500/10'
                                                }`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-foreground">₹{product.price.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/products/edit/${product._id}`} className="text-text-muted hover:text-foreground p-2 inline-block">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="text-text-muted hover:text-red-500 p-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
