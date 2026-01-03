import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select("addresses").lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const res = NextResponse.json(user.addresses);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        // Basic validation
        if (!data.address || !data.city || !data.postalCode || !data.country) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // If this is the default address, unset others
        if (data.isDefault) {
            await User.updateOne(
                { _id: session.user.id, "addresses.isDefault": true },
                { $set: { "addresses.$.isDefault": false } }
            );
        }

        // If it's the first address, make it default automatically
        const user = await User.findById(session.user.id);
        if (user.addresses.length === 0) {
            data.isDefault = true;
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $push: { addresses: data } },
            { new: true, runValidators: true }
        ).select("addresses");

        const res = NextResponse.json(updatedUser.addresses);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: "Address ID required" }, { status: 400 });
        }

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        ).select("addresses");

        const res = NextResponse.json(updatedUser.addresses);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { _id, ...updateData } = data;

        if (!_id) {
            return NextResponse.json({ error: "Address ID required" }, { status: 400 });
        }

        // Basic validation
        if (!updateData.address || !updateData.city || !updateData.postalCode || !updateData.country) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // If this is set to default, unset others first
        if (updateData.isDefault) {
            await User.updateOne(
                { _id: session.user.id, "addresses.isDefault": true },
                { $set: { "addresses.$.isDefault": false } }
            );
        }

        // We use $set with array filters to update the specific item in the array
        // However, simple findOneAndUpdate with array filter is cleaner

        // Construct the update object dynamically to avoid overwriting with nulls if partial update (though we expect full object)
        const updateFields = {};
        for (const [key, value] of Object.entries(updateData)) {
            updateFields[`addresses.$.${key}`] = value;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: session.user.id, "addresses._id": _id },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("addresses");

        if (!updatedUser) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        const res = NextResponse.json(updatedUser.addresses);
        res.headers.set('Cache-Control', 'private, no-store');
        return res;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
