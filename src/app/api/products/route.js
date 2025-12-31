import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(req) {
    try {
        await dbConnect();

        // Todo: Add stricter auth check here
        const body = await req.json();

        // Create Product
        const product = await Product.create(body);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'newest';

        let query = {};

        // Search Logic
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Category Filter
        if (category) {
            // If category is provided, it might optionally overlap with search, 
            // but usually specific filter takes precedence or ANDs with search.
            // Using AND logic:
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
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

        const products = await Product.find(query).sort(sortOption);

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
