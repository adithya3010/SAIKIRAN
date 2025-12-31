import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();

        // Function to list indexes
        const collection = User.collection;
        const indexes = await collection.indexes();

        const indexNames = indexes.map(idx => idx.name);
        console.log("Current indexes:", indexNames);

        let message = "Indexes found: " + indexNames.join(", ");

        if (indexNames.includes("googleId_1")) {
            await collection.dropIndex("googleId_1");
            message += ". | SUCCESS: Dropped 'googleId_1' index.";
        } else {
            message += ". | 'googleId_1' index NOT found.";
        }

        return NextResponse.json({ message, indexes: indexNames }, { status: 200 });

    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json(
            { message: "Error cleaning DB", error: error.message },
            { status: 500 }
        );
    }
}
