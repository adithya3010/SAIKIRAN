import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Image from 'next/image';
import { unstable_noStore as noStore } from 'next/cache';
import ProductActions from '@/components/product/ProductActions';
import Accordion from '@/components/ui/Accordion';
import ProductGrid from '@/components/product/ProductGrid';

export async function generateStaticParams() {
    try {
        await dbConnect();
        const products = await Product.find({}, '_id').limit(50).lean();
        return products.map((product) => ({
            id: product._id.toString(),
        }));
    } catch (e) {
        console.error("Error generating static params", e);
        return [];
    }
}

async function getProduct(id) {
    noStore();
    try {
        await dbConnect();
        const product = await Product.findById(id).lean();
        if (!product) return null;
        return {
            ...product,
            _id: product._id.toString(),
            id: product._id.toString(),
            createdAt: product.createdAt?.toISOString(),
            colors: product.colors?.map(c => ({
                ...c,
                _id: c._id ? c._id.toString() : undefined
            })) || []
        };
    } catch (error) {
        return null;
    }
}

async function getRecommendedProducts(category, currentId) {
    try {
        await dbConnect();
        // Fetch 4 products from same category, excluding current one
        const products = await Product.find({
            category: category,
            _id: { $ne: currentId }
        }).limit(4).lean();

        return products.map(p => ({
            ...p,
            _id: p._id.toString(),
            id: p._id.toString(),
            createdAt: p.createdAt?.toISOString(),
            colors: p.colors?.map(c => ({
                ...c,
                _id: c._id ? c._id.toString() : undefined
            })) || []
        }));
    } catch (error) {
        return [];
    }
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const recommendedProducts = await getRecommendedProducts(product.category, product._id);

    return (
        <div className="pt-[100px] pb-20 bg-black text-white min-h-screen">
            {/* Note: User wanted a specific style. 
               The screenshot showed a White background UI ("thehouseofrare.com" style).
               However, the current app is dark mode ("bg-black").
               Transitioning this specific page to Light Mode might clash with Header/Footer if they are forced Dark.
               
               Let's check the global style. The user said "all over the website it should load products from mongo" 
               and "update the product info page like screenshot". The screenshot IS light mode.
               BUT the rest of the site is Dark Mode (Monochrome Black).
               
               DECISION: I will keep the DARK MODE to match the brand `MAY BE NOT` / `KSHRA` which is dark.
               I will adapt the LAYOUT of the screenshot (Right side details, accordions, etc.) but keep the COLORS dark.
               Unless the user explicitly asked for Light Mode rebranding.
               "Hero Section Rebranding" context earlier was "Monochrome", usually implying B&W.
               I will stick to active Dark Theme but use the LAYOUT features.
               If I use `bg-white` here it will look broken with the fixed black header.
               
               Reverting `bg-white` to `bg-black` but using the layout.
            */}

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Images (Grid or Slider) */}
                    {/* Screenshot shows a large main image. Let's do a grid of 2 or a large one. */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="aspect-[3/4] relative w-full bg-neutral-900 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-grey-500">No Image</div>
                            )}
                        </div>
                        {/* Secondary Images Grid if available */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {product.images.slice(1, 3).map((img, idx) => (
                                    <div key={idx} className="aspect-[3/4] relative bg-neutral-900">
                                        <Image src={img} alt={`${product.name} ${idx + 2}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details (Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-[100px]">

                            {/* Product Actions Component */}
                            <ProductActions product={product} />

                            {/* Accordions */}
                            <div className="mt-8 border-t border-grey-800">
                                <Accordion title="Description" defaultOpen={true}>
                                    <p>{product.description}</p>
                                    <ul className="mt-4 list-disc list-inside space-y-1 text-xs">
                                        <li>Fabric: {product.fabric}</li>
                                        <li>Fit: {product.fit}</li>
                                        <li>Occasion: {product.occasion}</li>
                                    </ul>
                                </Accordion>
                                <Accordion title="Manufacturer Details">
                                    <p>Made in India.</p>
                                    <p>Marketed by KSHRA Inc.</p>
                                </Accordion>
                                <Accordion title="Shipping, Return and Exchange">
                                    <p>Free shipping on all prepaid orders.</p>
                                    <p>7-day easy return and exchange policy.</p>
                                </Accordion>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Recommended Section */}
                <div className="mt-32">
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-10">Recommended</h3>
                    <ProductGrid products={recommendedProducts} title="" />
                </div>
            </div>
        </div>
    );
}
