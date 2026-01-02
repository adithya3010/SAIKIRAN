"use client";
import React, { useEffect, useState } from 'react';
import { useTheme } from "next-themes";
import Button from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    // Add mounted check to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router]);

    if (status === "loading" || !mounted) {
        return (
            <div className="p-12 text-center text-text-muted">Loading...</div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="p-8 md:p-12 pb-20 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-outfit font-bold uppercase mb-2 text-foreground">Settings</h1>
                <p className="text-text-muted">Manage your admin profile and preferences.</p>
            </div>

            <div className="bg-bg-secondary border border-border-primary rounded-lg p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center text-2xl font-bold uppercase border border-border-secondary">
                        {session.user?.name?.[0] || "A"}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{session.user?.name}</h2>
                        <p className="text-muted-foreground">{session.user?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{session.user?.role}</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-border-primary space-y-6">
                    {/* Theme Settings */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Appearance</h3>
                        <div className="flex gap-2">
                            {['system', 'light', 'dark'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${theme === t
                                        ? 'bg-foreground text-background shadow-md'
                                        : 'bg-bg-tertiary text-foreground hover:bg-bg-primary'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                        <Button
                            variant="solid"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-red-500 hover:bg-red-600 text-white border-red-500 w-full sm:w-auto"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
