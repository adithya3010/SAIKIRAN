import ProductGrid from '@/components/product/ProductGrid';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { unstable_noStore as noStore } from 'next/cache';

async function getNewArrivals() {
    noStore();
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ createdAt: -1 }).limit(20).lean();
        return products.map(product => {
            const serializeColors = (product.colors || []).map(c => ({
                ...c,
                _id: c?._id ? c._id.toString() : undefined,
            }));

            const serializeVariants = (product.variants || []).map(v => ({
                ...v,
                _id: v?._id ? v._id.toString() : undefined,
                color: v?.color
                    ? {
                        ...v.color,
                        _id: v.color?._id ? v.color._id.toString() : undefined,
                    }
                    : v?.color,
            }));

            return {
                ...product,
                _id: product._id.toString(),
                id: product._id.toString(),
                createdAt: product.createdAt?.toISOString(),
                updatedAt: product.updatedAt?.toISOString?.(),
                colors: serializeColors,
                variants: serializeVariants,
            };
        });
    } catch (error) {
        console.error("Failed to fetch new arrivals", error);
        return [];
    }
}

export default async function NewArrivalsPage() {
    const newArrivals = await getNewArrivals();

    return (
        <div className="pt-[80px]">
            <div className="bg-black py-24 px-4 text-center border-b border-border-secondary">
                <h1 className="font-outfit text-4xl md:text-6xl font-bold uppercase text-white mb-6 tracking-widest">New Arrivals</h1>
                <p className="text-grey-400 text-lg max-w-2xl mx-auto">
                    The latest additions to our monochrome collection. Engineered for the modern shadow.
                </p>
            </div>

            <ProductGrid title="" products={newArrivals} />
        </div>
    );
}
