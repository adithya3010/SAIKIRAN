import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
// Import authOptions if defined in a separate file, or use relevant session logic
// For this example, assuming standard next-auth usage. 
// Note: In App Router, you typically access session via generic handlers or helper

export async function GET(request) {
    await dbConnect();

    try {
        // Simple Admin Role Check (In production, use middleware or more robust session check)
        // For now, fetching all orders sorted by date
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: orders });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();

        // Basic validation could go here

        const order = await Order.create(body);
        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
