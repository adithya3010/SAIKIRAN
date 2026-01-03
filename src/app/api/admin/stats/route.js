import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const revenueAgg = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }
        ]);
        const totalRevenue = revenueAgg?.[0]?.total || 0;

        // Recent Orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        const res = NextResponse.json({
            success: true,
            data: {
                totalOrders,
                totalUsers,
                totalProducts,
                totalRevenue,
                recentOrders
            }
        });
        // Admin-only endpoint: allow short private caching (browser) but prevent CDN sharing.
        res.headers.set('Cache-Control', 'private, max-age=30');
        return res;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
