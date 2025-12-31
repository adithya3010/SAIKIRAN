"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 px-4 md:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Account</h1>
                    <p className="text-gray-400">Manage your profile and settings</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                            {session.user?.name?.[0] || "U"}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{session.user?.name}</h2>
                            <p className="text-gray-400">{session.user?.email}</p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{session.user?.role}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                        <Button
                            variant="outline"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full sm:w-auto"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
