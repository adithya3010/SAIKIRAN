"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
    const router = useRouter();
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loginAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // We use the same credentials provider, but we will redirect to dashboard on success
        const result = await signIn("credentials", {
            ...data,
            redirect: false,
        });

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Ideally we check if the user is actually an admin here or let the dashboard redirect if not
            router.push("/admin/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground transition-colors duration-300">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-red-500">
                        Admin Portal
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={loginAdmin}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-t-md border-0 bg-bg-secondary py-1.5 text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Admin Email"
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
                                className="relative block w-full rounded-b-md border-0 bg-bg-secondary py-1.5 text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 px-3 mt-2"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <Button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 border-none"
                            disabled={loading}
                        >
                            {loading ? "Accessing..." : "Enter Dashboard"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
