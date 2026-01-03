"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-80px)] w-full bg-black flex flex-col md:flex-row items-center justify-center overflow-hidden">

            {/* Background Gradient - Spotlight Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_80%_50%,_#404040_0%,_#1a1a1a_40%,_#000000_80%)] opacity-80" />

            {/* Content Container */}
            <div className="container mx-auto px-4 md:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between z-10 h-full">

                {/* Left Side: Text & Buttons */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">
                    <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-bold uppercase tracking-tight leading-[1.1] text-white mb-2">
                        OWN THE <br />
                        <span className="text-neutral-200">UNORDINARY</span>
                        <span className="text-neutral-500">.</span>
                    </h1>

                    {/* Divider Line */}
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent md:bg-neutral-700 md:bg-none md:w-32 md:h-[1px] my-6" />

                    <p className="text-neutral-400 text-base md:text-lg max-w-xs md:max-w-md font-medium tracking-wide mb-8">
                        Premium monochrome t-shirt for those who stand out without trying.
                    </p>

                    {/* Mobile Image (Visible only on mobile) */}
                    <div className="relative w-full aspect-square max-w-[350px] md:hidden mb-8">
                        <Image
                            src="/hero-tshirts-mobile.png"
                            alt="May Be Not Ordinary T-Shirts"
                            fill
                            priority
                            sizes="(max-width: 768px) 350px, 0px"
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>

                    <div className="flex flex-col w-full max-w-[350px] md:max-w-none md:flex-row gap-4">
                        <Link href="/shop" className="w-full md:w-auto">
                            <button className="w-full md:w-auto px-10 py-4 bg-[#e5e5e5] text-black font-bold uppercase tracking-wider text-sm rounded hover:bg-white transition-all transform hover:scale-105">
                                Shop Now
                            </button>
                        </Link>
                        <Link href="/about" className="w-full md:w-auto">
                            <button className="w-full md:w-auto px-10 py-4 bg-transparent border border-neutral-600 text-white font-bold uppercase tracking-wider text-sm rounded hover:bg-neutral-900 hover:border-neutral-400 transition-all">
                                Explore More
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Side: Image (Visible only on Desktop) */}
                <div className="hidden md:flex w-1/2 justify-center items-center relative h-screen">
                    <div className="relative w-full h-full max-w-[700px]">
                        <Image
                            src="/hero-tshirts-mobile.png"
                            alt="May Be Not Ordinary T-Shirts"
                            fill
                            priority
                            sizes="(min-width: 768px) 700px, 0px"
                            className="object-contain object-center drop-shadow-2xl"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}
