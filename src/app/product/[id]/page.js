import { getProductById, products } from '@/lib/data';
import AddToCart from '@/components/product/AddToCart';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return products.map((product) => ({
        id: product.id.toString(),
    }));
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="pt-[120px] pb-24 px-4 min-h-screen max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Image Section */}
                <div className="bg-grey-100 aspect-[3/4] relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-b from-grey-800 to-black" />
                    {/* Real image would be here */}
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="text-sm uppercase tracking-widest text-grey-400">{product.category}</span>
                    </div>
                    <h1 className="font-outfit text-4xl md:text-5xl font-bold uppercase text-white mb-6 uppercase tracking-wider">{product.name}</h1>
                    <p className="text-2xl font-light text-grey-300 mb-8">₹{product.price.toFixed(2)}</p>

                    <p className="text-grey-400 leading-relaxed mb-12 max-w-lg">
                        {product.description}
                    </p>

                    <AddToCart product={product} />

                    <div className="border-t border-border-secondary pt-8">
                        <h3 className="text-white text-sm uppercase tracking-widest mb-4">Details</h3>
                        <ul className="list-disc list-inside text-grey-400 space-y-2 text-sm">
                            {product.details && product.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
