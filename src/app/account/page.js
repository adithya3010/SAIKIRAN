"use client";

import { useTheme } from "next-themes";
import Button from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Account</h1>
                    <p className="text-muted-foreground">Manage your profile and settings</p>
                </div>

                <div className="bg-bg-secondary border border-border-primary rounded-lg p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center text-2xl font-bold uppercase border border-border-secondary">
                            {session.user?.name?.[0] || "U"}
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
        </div>
    );
}
