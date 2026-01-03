import ProductGrid from '@/components/product/ProductGrid';
import { notFound } from 'next/navigation';
import { getProductsByCategory } from '@/lib/catalog';

export const runtime = 'nodejs';
export const revalidate = 300;

async function getProducts(category) {
    return getProductsByCategory(category);
}

export default async function CategoryPage({ params }) {
    const { category } = await params;
    const products = await getProducts(category);

    // If no products found, we don't necessarily want 404 if it's a valid category page but just empty.
    // But keeping existing behavior (404) if strictly 0.

    // if (products.length === 0) {
    //     notFound();
    // }

    const title = category === 'all' ? 'All Products' : `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`;

    return (
        <div className="pt-24 min-h-screen">
            <ProductGrid title={title} products={products} />
            {products.length === 0 && (
                <div className="text-center text-text-muted mt-10">
                    <p>No products found in this category.</p>
                </div>
            )}
        </div>
    );
}
