import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
    try {
        await dbConnect();

        // simple search if needed later via query params
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}
