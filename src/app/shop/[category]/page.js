import { getProductsByCategory } from '@/lib/data';
import ProductGrid from '@/components/product/ProductGrid';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return [
        { category: 'men' },
        { category: 'women' },
        { category: 'accessories' },
    ];
}

export default async function CategoryPage({ params }) {
    const { category } = await params;
    const products = getProductsByCategory(category);

    if (products.length === 0) {
        notFound();
    }

    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="pt-24 min-h-screen">
            <ProductGrid title={`${title}'s Collection`} products={products} />
        </div>
    );
}
