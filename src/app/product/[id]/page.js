import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';

import { getProductById, getRecommendedProducts } from '@/lib/catalog';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function generateStaticParams() {
    // Keep this lightweight; ISR will handle uncached ids.
    return [];
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    const recommendedProducts = await getRecommendedProducts({ category: product.category, currentId: product._id });

    return (
        <div className="pt-[100px] pb-20 bg-background text-foreground min-h-screen transition-colors duration-300">
            <ProductView product={product} recommendedProducts={recommendedProducts} />
        </div>
    );
}
