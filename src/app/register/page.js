"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
    const router = useRouter();
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const registerUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            router.push("/login"); // Redirect to login after successful registration
        } else {
            const err = await response.json();
            setError(err.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
                        Register your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={registerUser}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full rounded-t-md border-0 bg-white/10 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 mb-2"
                                placeholder="Name"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full border-0 bg-white/10 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-b-md border-0 bg-white/10 py-1.5 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 mt-2"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link href="/login" className="font-medium text-gray-400 hover:text-white">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <Button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
