"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function HeroModern() {
    const router = useRouter();
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Image - Desktop */}
            <div className="hidden md:block absolute inset-0 w-full h-full">
                <Image
                    src="/hero-modern-desktop.png"
                    alt="Modern Hero Desktop"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
            </div>

            {/* Background Image - Mobile */}
            <div className="md:hidden absolute inset-0 w-full h-full">
                <Image
                    src="/hero-modern-mobile.png"
                    alt="Modern Hero Mobile"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
            </div>

            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Content - Centered */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
                {/* Mobile Title Size & Spacing */}
                <h1 className="font-outfit text-[2.75rem] leading-none md:text-7xl font-light uppercase text-[#F0EFEB] tracking-[0.2em] mb-5 animate-fade-in-up">
                    MAY BE NOT
                </h1>

                {/* Mobile Subtitle - Specific Break */}
                <p className="font-outfit text-lg md:text-2xl text-[#E0E0E0] mb-10 tracking-wide leading-relaxed animate-fade-in-up delay-200 font-light opacity-90">
                    Timeless unisex streetwear <br />
                    in premium oversized fits
                </p>

                {/* Buttons - Always Row, Even on Mobile */}
                <div className="flex flex-row gap-4 w-full justify-center animate-fade-in-up delay-300">
                    <Button
                        size="lg"
                        className="bg-[#0A0A0C] text-[#E6DED4] hover:bg-[#333333] border border-[#181818] hover:border-[#333333] rounded-[2px] px-6 py-3.5 text-[0.75rem] md:text-[0.8rem] font-bold tracking-[0.15em] flex-1 max-w-[160px] h-12 flex items-center justify-center uppercase transition-colors duration-300"
                        onClick={() => router.push('/shop')}
                    >
                        SHOP NOW
                    </Button>
                    <Button
                        size="lg"
                        className="bg-[#F1E9DE] text-[#462B21] hover:bg-[#CFC9B8] border border-[#D9D4C5] rounded-[2px] px-6 py-3.5 text-[0.75rem] md:text-[0.8rem] font-bold tracking-[0.15em] flex-1 max-w-[170px] h-12 flex items-center justify-center uppercase"
                        onClick={() => router.push('/about')}
                    >
                        ABOUT
                    </Button>
                </div>
            </div>
        </div>
    );
}
