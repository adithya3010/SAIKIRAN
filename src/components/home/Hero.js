"use client";
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-[80px] pb-8 md:pb-0">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#3a3a3a] to-[#9a9a9a]"
            />

            <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center px-4 md:px-8 lg:px-16 gap-6 md:gap-12 py-8 md:py-0">

                {/* Left Content */}
                <div className="flex flex-col items-center md:items-start justify-center space-y-4 md:space-y-6 relative text-center md:text-left order-2 md:order-1">
                    <h1 className="font-outfit text-[clamp(2rem,8vw,5rem)] font-bold leading-[1.1] uppercase text-white tracking-tight">
                        STAND OUT WITH<br />
                        UNIQUE UNISEX<br />
                        T-SHIRTS
                    </h1>

                    <p className="font-outfit text-[clamp(1rem,3vw,1.5rem)] text-white/90 font-light">
                        Be Different. Be Yourself.
                    </p>

                    <Link href="/shop">
                        <button className="bg-black text-white font-outfit font-bold text-sm md:text-base uppercase tracking-[0.2em] px-8 md:px-12 py-3 md:py-4 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mt-2 md:mt-4">
                            SHOP NOW
                        </button>
                    </Link>
                </div>

                {/* Right Side - T-Shirt Products Display */}
                <div className="relative h-[400px] md:h-full w-full flex items-center justify-center order-1 md:order-2">
                    <div className="relative w-full h-full flex items-center justify-center">

                        {/* Black T-Shirt - Left/Back layer */}
                        <div className="absolute left-[8%] md:left-[5%] top-[10%] md:top-[15%] w-[48%] md:w-[55%] z-10 transform rotate-[-5deg] hover:rotate-[-2deg] hover:scale-105 transition-all duration-500">
                            <img
                                src="/black_tshirt.png"
                                alt="Black May Be Not Ordinary T-Shirt"
                                className="w-full h-auto object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />
                        </div>

                        {/* White T-Shirt - Right/Front layer */}
                        <div className="absolute right-[2%] md:right-[0%] bottom-[8%] md:bottom-[12%] w-[52%] md:w-[58%] z-20 transform rotate-[5deg] hover:rotate-[2deg] hover:scale-105 transition-all duration-500">
                            <img
                                src="/white_tshirt.png"
                                alt="White May Be Not Ordinary T-Shirt"
                                className="w-full h-auto object-contain filter drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)] md:drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                            />
                        </div>

                        {/* Logo Watermark - Subtle background element */}


                    </div>
                </div>

            </div>
        </section>
    );
}
