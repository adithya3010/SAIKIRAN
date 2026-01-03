import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

// GET: Fetch single product
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const product = await Product.findById(id)
            .select('_id name slug description price images category createdAt variants')
            .lean();

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

        const res = NextResponse.json({ success: true, data: normalized });
        res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=1800');
        return res;
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
