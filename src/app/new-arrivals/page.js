import ProductGrid from '@/components/product/ProductGrid';
import { products } from '@/lib/data';

export default function NewArrivalsPage() {
    const newArrivals = products.filter(product => product.isNew);

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
