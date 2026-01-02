"use client";
import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function HeroCinematic() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 w-full h-full opacity-60">
                {/* Desktop Background - Ken Burns Pan Effect */}
                <div className="hidden md:block absolute inset-0 w-full h-full animate-ken-burns">
                    <Image
                        src="/hero-cinematic-desktop.png"
                        alt="Cinematic Background Desktop"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                </div>

                {/* Mobile Background - Different Scale Animation */}
                <div className="md:hidden absolute inset-0 w-full h-full animate-ken-burns-mobile">
                    <Image
                        src="/hero-cinematic-mobile.png"
                        alt="Cinematic Background Mobile"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                </div>
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

            {/* Floating Texture Overlay for Depth */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
                <Image
                    src="/cinematic-texture.png"
                    alt="Texture"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-end md:justify-center text-center px-4 pb-32 md:pb-0">
                <style jsx>{`
                    @keyframes ken-burns {
                        0% { transform: scale(1) translate(0, 0); }
                        50% { transform: scale(1.1) translate(-1%, -1%); }
                        100% { transform: scale(1) translate(0, 0); }
                    }
                    @keyframes ken-burns-mobile {
                        0% { transform: scale(1) translate(0, 0); }
                        50% { transform: scale(1.15) translate(0, -2%); }
                        100% { transform: scale(1) translate(0, 0); }
                    }
                    .animate-ken-burns {
                        animation: ken-burns 20s ease-in-out infinite alternate;
                    }
                    .animate-ken-burns-mobile {
                        animation: ken-burns-mobile 15s ease-in-out infinite alternate;
                    }
                `}</style>

                <h1 className="font-outfit text-6xl md:text-9xl font-bold uppercase text-white tracking-tighter mb-4 animate-fade-in-up drop-shadow-2xl">
                    MAY BE NOT
                </h1>
                <p className="font-light text-lg md:text-2xl text-white/80 max-w-lg mb-12 tracking-widest uppercase animate-fade-in-up delay-200">
                    Defined by what we are not
                </p>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-8 animate-fade-in-up delay-300">
                    <Button
                        size="lg"
                        variant="primary"
                        className="bg-white text-black hover:bg-neutral-200 border-none w-full md:w-auto py-6 text-sm tracking-[0.2em] font-bold"
                        onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        VIEW LATEST
                    </Button>
                </div>
            </div>
        </div>
    );
}
