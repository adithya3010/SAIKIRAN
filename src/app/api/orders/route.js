import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { generateOrderPlacedEmail } from "@/lib/emailTemplates";

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

        await dbConnect();

        // 1. Validate Stock & Update
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.name}`);
            }

            // Find variant
            const variantIndex = product.variants.findIndex(v =>
                v.size === item.selectedSize &&
                v.color.name === item.selectedColor.name
            );

            if (variantIndex === -1) {
                throw new Error(`Variant not found for ${item.name} (${item.selectedSize}, ${item.selectedColor.name})`);
            }

            const variant = product.variants[variantIndex];

            if (variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name} (${item.selectedSize}, ${item.selectedColor.name}). Available: ${variant.stock}`);
            }

            // Reduce stock
            product.variants[variantIndex].stock -= item.quantity;
            await product.save();
        }

        // 2. Generate Order Number
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // 3. Create Order
        const order = new Order({
            user: session.user.id,
            orderNumber,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: paymentMethod !== 'Cash on Delivery', // Basic logic
            isDelivered: false,
        });



        // ... existing imports ...

        // ... inside POST ...

        const createdOrder = await order.save();

        // Send Email Notification (Async - don't block response)
        try {
            const userEmail = session.user.email;
            if (userEmail) {
                const emailHtml = generateOrderPlacedEmail(createdOrder);
                await sendEmail({
                    to: userEmail,
                    subject: `Order Confirmation - ${createdOrder.orderNumber}`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error("Failed to send order confirmation email:", emailError);
            // Don't fail the request if email fails, just log it
        }

        return NextResponse.json(createdOrder, { status: 201 });

    } catch (error) {
        console.error("Order creation failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
