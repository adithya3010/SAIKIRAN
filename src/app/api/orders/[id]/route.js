import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        await dbConnect();
        const order = await Order.findById(id).populate('user', 'name email');

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Authorization check: Admin can see all, Users can only see their own
        if (session.user.role !== 'admin' && order.user._id.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const data = await req.json();

        await dbConnect();

        const updateData = { status: data.status };
        if (data.status === 'Delivered') {
            updateData.isDelivered = true;
            updateData.deliveredAt = Date.now();
        }
        if (data.status === 'Processing' || data.status === 'Shipped') {
            updateData.isDelivered = false;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
