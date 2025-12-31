"use client";
import React, { useState } from 'react';
import { heroVariants, activeHeroId, setActiveHeroId } from '@/lib/data';

export default function HeroAdminPage() {
    // Local state for immediate UI feedback mock
    const [currentActiveId, setCurrentActiveId] = useState(activeHeroId);

    const handleApplyHero = (id) => {
        setActiveHeroId(id);
        setCurrentActiveId(id);
        // In real app, this would be an API call
        alert(`Hero Variant ${id} applied successfully!`);
    };

    return (
        <div className="p-8 md:p-12 mb-20">
            <div className="mb-10">
                <h1 className="text-4xl font-outfit font-bold uppercase mb-2">Hero Sections</h1>
                <p className="text-grey-400">Choose and apply the active hero design for the homepage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {heroVariants.map((hero) => (
                    <div
                        key={hero.id}
                        className={`group relative bg-black border rounded-xl overflow-hidden transition-all duration-300 ${currentActiveId === hero.id
                                ? 'border-white ring-2 ring-white/20'
                                : 'border-white/10 hover:border-white/50'
                            }`}
                    >
                        {/* Preview Image Placeholder */}
                        <div className="aspect-video bg-neutral-900 relative">
                            {/* <Image src={hero.image} fill className="object-cover" /> */}
                            <div className="absolute inset-0 flex items-center justify-center text-grey-600 font-mono text-xs uppercase">
                                Preview: {hero.name}
                            </div>

                            {/* Active Badge */}
                            {currentActiveId === hero.id && (
                                <div className="absolute top-4 right-4 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    Active
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-1">{hero.name}</h3>
                            <p className="text-sm text-grey-400 mb-6 min-h-[40px]">{hero.description}</p>

                            <button
                                onClick={() => handleApplyHero(hero.id)}
                                disabled={currentActiveId === hero.id}
                                className={`w-full py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors ${currentActiveId === hero.id
                                        ? 'bg-neutral-800 text-grey-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-grey-200'
                                    }`}
                            >
                                {currentActiveId === hero.id ? 'Currently Active' : 'Apply Design'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
