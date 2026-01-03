import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(req) {
    try {
        await dbConnect();

        // Todo: Add stricter auth check here
        const body = await req.json();

        // Derive inStock from stock quantities when variants/colors exist.
        const variantStockTotal = Array.isArray(body?.variants)
            ? body.variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
            : 0;
        const colorStockTotal = Array.isArray(body?.colors)
            ? body.colors.reduce((sum, c) => sum + (Number(c?.stock) || 0), 0)
            : 0;
        const inferredInStock = (variantStockTotal > 0) || (colorStockTotal > 0);

        if (Array.isArray(body?.variants) && body.variants.length > 0) {
            body.inStock = inferredInStock;
        } else if (Array.isArray(body?.colors) && body.colors.length > 0) {
            body.inStock = inferredInStock;
        }

        // Create Product
        const product = await Product.create(body);

        const res = NextResponse.json({ success: true, data: product }, { status: 201 });
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = (searchParams.get('search') || '').trim().toLowerCase();
        const category = (searchParams.get('category') || '').trim().toLowerCase();
        const sort = searchParams.get('sort') || 'newest';

        let query = {};

        // Search Logic
        if (search) {
            // Fast path: indexed prefix search
            // Note: for "contains" search at scale, use Atlas Search.
            query.nameNormalized = { $regex: new RegExp(`^${escapeRegExp(search)}`) };
        }

        // Category Filter
        if (category) {
            query.categoryNormalized = category;
        }

        // Sorting Logic
        let sortOption = {};
        switch (sort) {
            case 'price-low-high':
                sortOption = { price: 1 };
                break;
            case 'price-high-low':
                sortOption = { price: -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        // Keep payload small; avoid sending large fields if not needed.
        const products = await Product.find(query)
            .select('_id name slug price images category createdAt variants')
            .sort(sortOption)
            .lean();

        const normalized = products.map((p) => ({
            ...p,
            id: p?._id?.toString?.() || p?._id,
            _id: p?._id?.toString?.() || p?._id,
        }));

        const res = NextResponse.json({ success: true, data: normalized });
        // Catalog data is safe for CDN caching.
        res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=1800');
        return res;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
