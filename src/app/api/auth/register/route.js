import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user", // Default role
        });

        return NextResponse.json(
            { message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        // Auto-fix for legacy googleId index
        if (error.code === 11000 && error.message.includes('googleId_1')) {
            console.log("Found legacy googleId index, dropping it...");
            try {
                await User.collection.dropIndex('googleId_1');
                console.log("Legacy index dropped. Retrying registration...");

                // Retry creation
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await User.create({
                    name,
                    email,
                    password: hashedPassword,
                    role: "user",
                });

                return NextResponse.json(
                    { message: "User registered successfully (index fixed)", user: { id: user._id, name: user.name, email: user.email } },
                    { status: 201 }
                );
            } catch (retryError) {
                console.error("Retry failed:", retryError);
                return NextResponse.json(
                    { message: "Failed to fix legacy database index. Please manually drop 'googleId_1' index." },
                    { status: 500 }
                );
            }
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred while registering the user" },
            { status: 500 }
        );
    }
}
