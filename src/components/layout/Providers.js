"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";

export function Providers({ children }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <CartProvider>
                    {children}
                </CartProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
