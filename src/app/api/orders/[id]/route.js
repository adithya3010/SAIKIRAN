import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { generateOrderShippedEmail } from "@/lib/emailTemplates";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
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

        const { id } = await params;
        await dbConnect();
        const data = await req.json();

        const updateData = { status: data.status };
        if (data.trackingDetails) {
            updateData.trackingDetails = data.trackingDetails;
        }
        if (data.status === 'Delivered') {
            updateData.isDelivered = true;
            updateData.deliveredAt = Date.now();
        }
        if (['Placed', 'Processing', 'Packed', 'Shipped'].includes(data.status)) {
            updateData.isDelivered = false;
        }

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        // Send Email Notification if Shipped
        if (data.status === 'Shipped' && order) {
            try {
                const userEmail = order.user.email;
                if (userEmail) {
                    const emailHtml = generateOrderShippedEmail(order);
                    await sendEmail({
                        to: userEmail,
                        subject: `Your Order #${order.orderNumber} has Shipped!`,
                        html: emailHtml
                    });
                }
            } catch (emailError) {
                console.error("Failed to send order shipped email:", emailError);
            }
        }

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
