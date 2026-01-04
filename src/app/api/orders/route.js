import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { createCheckoutJob, enqueueCheckoutJob, getCheckoutQueueLength } from "@/lib/checkoutQueue";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // If admin, return all. If user, return theirs.
    if (session.user.role === 'admin') {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    } else {
        const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = data;

        if (orderItems && orderItems.length === 0) {
            return NextResponse.json({ error: "No order items" }, { status: 400 });
        }

        // Map frontend address format to backend schema (fullName)
        if (shippingAddress && !shippingAddress.fullName) {
            if (shippingAddress.firstName || shippingAddress.lastName) {
                shippingAddress.fullName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim();
            }
        }

        // Basic shape validation to protect the worker and DB.
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json({ error: "No order items" }, { status: 400 });
        }
        if (orderItems.length > 50) {
            return NextResponse.json({ error: "Too many items" }, { status: 400 });
        }
        if (!shippingAddress) {
            return NextResponse.json({ error: "Missing shipping address" }, { status: 400 });
        }
        if (!paymentMethod) {
            return NextResponse.json({ error: "Missing payment method" }, { status: 400 });
        }

        // Optional backpressure under load.
        const qlen = await getCheckoutQueueLength();
        if (typeof qlen === 'number' && qlen > 2000) {
            return NextResponse.json({ error: "Checkout queue is busy, try again shortly" }, { status: 503 });
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const job = createCheckoutJob({
            user: { id: session.user.id, email: session.user.email },
            orderNumber,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        try {
            const jobId = await enqueueCheckoutJob(job);
            return NextResponse.json(
                {
                    success: true,
                    status: 'queued',
                    jobId,
                    orderNumber,
                },
                { status: 202 }
            );
        } catch (queueError) {
            console.error('Failed to enqueue checkout job:', queueError);
            return NextResponse.json(
                { error: 'Checkout is temporarily unavailable. Please try again.' },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error("Order creation failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
