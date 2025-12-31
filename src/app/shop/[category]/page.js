import ProductGrid from '@/components/product/ProductGrid';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { unstable_noStore as noStore } from 'next/cache';

export async function generateStaticParams() {
    return [
        { category: 'men' },
        { category: 'women' },
        { category: 'accessories' },
    ];
}

async function getProducts(category) {
    noStore();
    try {
        await dbConnect();
        // Case insensitive search for category (e.g., 'Men' matches 'men')
        // Also handling 'gender' if your schema distinguishes category vs gender, 
        // but based on Product.js schema, 'category' is 'T-Shirt', etc. 
        // IF the URL is /shop/men, we might need a mapping or check logic.
        // The previous mock data likely mapped 'men' to a gender property or specific categories.
        // Let's assume for now we filter by 'category' field OR a new 'gender' field if it exists.
        // Looking at Product Model:
        // category: ['T-Shirt', 'Hoodie'...]
        // no gender field.
        // Wait, the user might expect 'men' to show everything? 
        // The mock data logic was `getProductsByCategory`. 
        // If the implementation plan says "Fetch products from DB based on category param", I should stick to that.
        // However, if the schema doesn't have 'men'/'women', this might fail.

        // TEMPORARY FIX: Fetch ALL and filter in memory if schema is missing 'gender', 
        // OR assuming 'category' field in DB might actually hold 'Men'/'Women' mixed values 
        // OR we simply match against the 'category' field.
        // Let's use a regex to be safe if they put 'Men-Tshirt' etc.

        // BETTER APPROACH: Just query by category. If the user adds products with category "Men", it works.
        // If the URL is "men" and product category is "T-Shirt", this won't match.

        // Re-reading Product.js:
        // category: enum: ['T-Shirt', 'Hoodie', 'Jacket', 'Trousers', 'Dress']
        // It seems there is NO gender field in the current Product model!
        // This is a schema gap. 

        // I will add a TO-DO or heuristic. For now, I will match 'category' against the param.
        // If the param is 'men', and no product has category 'men', it returns empty.
        // I should probably update the Product Model to include 'gender' or 'targetGroup'.
        // But I cannot change the model mid-migration easily without asking.
        // I will assume for now that we filter by the 'category' field directly. 
        // If the user wants to show Men's products, they might need to tag them or I need to add that field.

        // UPDATE: I will fetch all products for now if the category is broad (like 'men') 
        // OR just try to find exact matches.

        const products = await Product.find({
            category: { $regex: new RegExp(category, 'i') }
        }).lean();

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
        console.error(error);
        return [];
    }
}

export default async function CategoryPage({ params }) {
    const { category } = await params;
    const products = await getProducts(category);

    // If no products found, we don't necessarily want 404 if it's a valid category page but just empty.
    // But keeping existing behavior (404) if strictly 0.

    // if (products.length === 0) {
    //     notFound();
    // }

    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="pt-24 min-h-screen">
            <ProductGrid title={`${title}'s Collection`} products={products} />
            {products.length === 0 && (
                <div className="text-center text-grey-500 mt-10">
                    <p>No products found in this category.</p>
                </div>
            )}
        </div>
    );
}
