import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { cacheKeyForUrl, redisGetJson, redisSetJson } from '@/lib/redisCache';
import { EDGE_CACHE_CONTROL, withEdgeCacheHeaders } from '@/lib/edgeCache';

// GET: Fetch single product
export async function GET(req, { params }) {
    try {
        const cacheKey = cacheKeyForUrl(req.url);
        const cached = await redisGetJson(cacheKey);
        if (cached) {
            return withEdgeCacheHeaders(NextResponse.json(cached), EDGE_CACHE_CONTROL);
        }

        await dbConnect();
        const { id } = await params;
        const t0 = Date.now();
        const product = await Product.findById(id)
            .select('_id name slug description price images category createdAt variants colors sizes inStock fit fabric printType occasion isNewProduct')
            .lean();
        const ms = Date.now() - t0;
        if (ms > 250) {
            console.warn('Slow Mongo query /api/products/[id]:', { ms, id });
        }

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const normalized = product
            ? {
                ...product,
                id: product?._id?.toString?.() || product?._id,
                _id: product?._id?.toString?.() || product?._id,
            }
            : product;

        const payload = { success: true, data: normalized };
        await redisSetJson(cacheKey, payload, 60);
        return withEdgeCacheHeaders(NextResponse.json(payload), EDGE_CACHE_CONTROL);
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// PUT: Update product
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
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

        const product = await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const res = NextResponse.json({ success: true, data: product });
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// DELETE: Remove product
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const res = NextResponse.json({ success: true, data: {} });
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
