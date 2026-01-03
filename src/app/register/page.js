"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden sm:overflow-hidden">
            {/* Mobile-only background */}
            <div className="absolute inset-0 lg:hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.16),rgba(0,0,0,0.78)_50%,rgba(0,0,0,1)_85%)]" />
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:44px_44px]" />
                <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* Brand Panel */}
                <div className="relative hidden lg:flex overflow-hidden border-r border-white/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.16),rgba(0,0,0,0.70)_50%,rgba(0,0,0,1)_80%)]" />
                    <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:48px_48px]" />

                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        <div className="flex items-center gap-3">
                           
                            <div className="leading-tight">
                                <div className="font-outfit font-bold uppercase tracking-[0.28em] text-sm">MAY BE NOT</div>
                                <div className="text-white/60 text-xs tracking-widest">CREATE YOUR ACCOUNT</div>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h1 className="font-outfit text-5xl font-bold uppercase tracking-tight leading-[1.05]">
                                Join the
                                <span className="block text-white/70">Monochrome</span>
                            </h1>
                            <p className="mt-4 text-white/70 leading-relaxed">
                                Create an account for faster checkout and order tracking.
                            </p>

                            <div className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/50">
                                <span className="h-[1px] w-10 bg-white/20" />
                                Clean. Bold. Unordinary.
                            </div>
                        </div>

                        <div className="text-white/40 text-xs tracking-widest">© {new Date().getFullYear()} MAY BE NOT</div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="flex items-center justify-center px-5 py-6 sm:px-6 sm:py-10 lg:px-12">
                    <div className="w-full max-w-md relative z-10">
                       

                        <div className="lg:hidden mb-5 text-center">
                            <h1 className="font-outfit text-4xl font-bold uppercase tracking-tight leading-[1.05]">
                                OWN THE <span className="text-white/70">UNORDINARY</span>
                            </h1>
                            <p className="mt-2 text-white/60 text-sm">Create your account in seconds.</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-5 sm:p-6 md:p-8">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-3xl font-outfit font-bold uppercase tracking-widest text-center lg:text-left">
                                    Register
                                </h2>
                                <p className="mt-2 text-white/60 text-sm text-center lg:text-left">
                                    Create your account in seconds.
                                </p>
                            </div>

   

                            <form className="space-y-4 sm:space-y-5" onSubmit={registerUser}>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="name" className="block text-xs uppercase tracking-[0.22em] text-white/60 mb-2">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 transition"
                                        placeholder="Your name"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email-address" className="block text-xs uppercase tracking-[0.22em] text-white/60 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 transition"
                                        placeholder="you@example.com"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs uppercase tracking-[0.22em] text-white/60 mb-2">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 transition"
                                        placeholder="Create a password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    href="/login"
                                    className="text-xs uppercase tracking-[0.22em] text-white/60 hover:text-white transition"
                                >
                                    Already have an account?
                                </Link>
                                <Link
                                    href="/"
                                    className="text-xs uppercase tracking-[0.22em] text-white/60 hover:text-white transition"
                                >
                                    Back to store
                                </Link>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center lg:text-left">{error}</p>}

                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-white text-black py-2.5 sm:py-3 font-bold uppercase tracking-[0.22em] text-xs hover:opacity-95 transition"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Create account"}
                            </Button>

                            <p className="text-[11px] text-white/45 leading-relaxed text-center lg:text-left">
                                By creating an account, you agree to our terms and privacy policy.
                            </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
