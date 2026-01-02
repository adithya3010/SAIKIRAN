"use client";
import React from 'react';
import Button from '@/components/ui/Button';

export default function HeroVideo() {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/hero-video-poster.jpg" // Optional poster
                >
                    <source src="/Cinematic_T_Shirt_Brand_Video_Creation.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content centered */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <h1 className="font-outfit text-5xl md:text-8xl font-bold uppercase text-white tracking-widest mb-6 animate-fade-in-up">
                    MAY BE NOT
                </h1>
                <p className="font-light text-xl md:text-2xl text-white/90 max-w-2xl mb-10 tracking-wide animate-fade-in-up delay-200">
                    Redefining minimalism. Premium essentials for the modern non-conformist.
                </p>
                <div className="flex gap-4 animate-fade-in-up delay-300">
                    <Button
                        size="lg"
                        variant="primary"
                        className="bg-white text-black hover:bg-white/90 border-transparent px-8 py-4 text-sm tracking-widest"
                        onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        EXPLORE COLLECTION
                    </Button>
                </div>
            </div>
        </div>
    );
}
