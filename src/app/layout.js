import { Outfit, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";
import CartDrawer from "@/components/cart/CartDrawer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "MAY BE NOT | Unisex Essentials",
  description: "Ordinary is overrated. Premium unisex t-shirts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <CartDrawer />
          <main className="pt-[80px]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
