"use client";
import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Inline styles for the custom fill animation */}
            <style jsx>{`
                @keyframes fillUp {
                    0% { clip-path: inset(100% 0 0 0); }
                    100% { clip-path: inset(0 0 0 0); }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .animate-fill {
                    animation: fillUp 2s ease-in-out infinite alternate;
                }
                .animate-breathe {
                    animation: breathe 3s ease-in-out infinite;
                }
            `}</style>

            <div className="relative w-64 h-64 md:w-80 md:h-80 animate-breathe">
                {/* Background Layer: Dimmed Outline */}
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/brand-loading.png"
                        alt="Loading..."
                        fill
                        className="object-contain filter invert"
                    />
                </div>

                {/* Foreground Layer: Filling Animation */}
                <div className="absolute inset-0 animate-fill">
                    <Image
                        src="/brand-loading.png"
                        alt="Loading..."
                        fill
                        className="object-contain filter invert drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    />
                </div>
            </div>
        </div>
    );
}
