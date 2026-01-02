import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { unstable_noStore as noStore } from 'next/cache';
import ProductView from '@/components/product/ProductView';

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

        // Serialize helper
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
            <ProductView product={product} recommendedProducts={recommendedProducts} />
        </div>
    );
}
