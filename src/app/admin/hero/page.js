"use client";
import React, { useState, useEffect } from 'react';
import { heroVariants } from '@/lib/data';

export default function HeroAdminPage() {
    const [currentActiveId, setCurrentActiveId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch current setting on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    // Map 'default' -> 1, 'creative' -> 2 based on our data file or simple mapping
                    // Let's assume heroVariants has IDs like 1 and 2.
                    // If data.heroVariant is 'default', activeId is 1. If 'creative', activeId is 2.
                    // We need to match this with what's in @/lib/data or just hardcode for now for safety.
                    const variantMap = { 'default': 1, 'creative': 2, 'video': 3, 'modern': 4 };
                    setCurrentActiveId(variantMap[data.heroVariant] || 1);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleApplyHero = async (id) => {
        setIsSaving(true);
        try {
            // Map ID back to string for DB
            // 1 -> 'default', 2 -> 'creative', 3 -> 'video', 4 -> 'modern'
            const variantMap = { 1: 'default', 2: 'creative', 3: 'video', 4: 'modern' };
            const variantString = variantMap[id] || 'default';

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heroVariant: variantString })
            });

            if (res.ok) {
                setCurrentActiveId(id);
                // Optional: Show toast
            } else {
                alert("Failed to save setting");
            }
        } catch (error) {
            console.error("Failed to save setting", error);
            alert("Error saving setting");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-white">Loading...</div>;

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
                        {/* Preview Image Placeholder - Using hero.image from data */}
                        <div className="aspect-video bg-neutral-900 relative">
                            <img src={hero.image} alt={hero.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

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
                                disabled={currentActiveId === hero.id || isSaving}
                                className={`w-full py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors ${currentActiveId === hero.id
                                    ? 'bg-neutral-800 text-grey-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-grey-200'
                                    }`}
                            >
                                {currentActiveId === hero.id ? 'Currently Active' : (isSaving ? 'Applying...' : 'Apply Design')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
