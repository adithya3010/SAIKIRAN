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

        // Serialize helper
        const serialize = (obj) => {
            const serialized = { ...obj };
            if (serialized._id) {
                serialized._id = serialized._id.toString();
                serialized.id = serialized._id;
            }
            if (serialized.createdAt) serialized.createdAt = serialized.createdAt.toISOString();
            if (serialized.updatedAt) serialized.updatedAt = serialized.updatedAt.toISOString();
            return serialized;
        };

        const serializedProduct = serialize(product);

        // Nested serialization
        if (serializedProduct.colors) {
            serializedProduct.colors = serializedProduct.colors.map(c => ({
                ...c,
                _id: c._id ? c._id.toString() : undefined
            }));
        }

        if (serializedProduct.variants) {
            serializedProduct.variants = serializedProduct.variants.map(v => ({
                ...v,
                _id: v._id ? v._id.toString() : undefined,
                color: v.color ? { ...v.color, _id: v.color._id ? v.color._id.toString() : undefined } : v.color
            }));
        }

        return serializedProduct;
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

        // Serialize helper (Inline for now or move to utils if needed repeatedly)
        const serialize = (obj) => {
            const serialized = { ...obj };
            if (serialized._id) {
                serialized._id = serialized._id.toString();
                serialized.id = serialized._id;
            }
            if (serialized.createdAt) serialized.createdAt = serialized.createdAt.toISOString();
            return serialized;
        };

        return products.map(p => {
            const s = serialize(p);
            if (s.colors) {
                s.colors = s.colors.map(c => ({ ...c, _id: c._id ? c._id.toString() : undefined }));
            }
            if (s.variants) {
                s.variants = s.variants.map(v => ({
                    ...v,
                    _id: v._id ? v._id.toString() : undefined,
                    color: v.color ? { ...v.color, _id: v.color._id ? v.color._id.toString() : undefined } : v.color
                }));
            }
            return s;
        });

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
        <div className="pt-[100px] pb-20 bg-background text-foreground min-h-screen transition-colors duration-300">
            {/* Semantic colors applied for Global Light/Dark mode support */}

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Images (Grid or Slider) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="aspect-[3/4] relative w-full bg-bg-secondary overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                            )}
                        </div>
                        {/* Secondary Images Grid if available */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {product.images.slice(1, 3).map((img, idx) => (
                                    <div key={idx} className="aspect-[3/4] relative bg-bg-secondary">
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
                            <div className="mt-8 border-t border-border-primary">
                                <Accordion title="Description" defaultOpen={true}>
                                    <p className="text-foreground/80">{product.description}</p>
                                    <ul className="mt-4 list-disc list-inside space-y-1 text-xs text-text-muted">
                                        <li>Fabric: {product.fabric}</li>
                                        <li>Fit: {product.fit}</li>
                                        <li>Occasion: {product.occasion}</li>
                                    </ul>
                                </Accordion>
                                <Accordion title="Manufacturer Details">
                                    <p className="text-foreground/80">Made in India.</p>
                                    <p className="text-foreground/80">Marketed by KSHRA Inc.</p>
                                </Accordion>
                                <Accordion title="Shipping, Return and Exchange">
                                    <p className="text-foreground/80">Free shipping on all prepaid orders.</p>
                                    <p className="text-foreground/80">7-day easy return and exchange policy.</p>
                                </Accordion>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Recommended Section */}
                <div className="mt-32">
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-10">Recommended</h3>
                    <ProductGrid products={recommendedProducts} title="" />
                </div>
            </div>
        </div>
    );
}
