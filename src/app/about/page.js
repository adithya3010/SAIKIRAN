export default function AboutPage() {
    return (
        <div className="pt-[140px] pb-24 px-4 min-h-screen max-w-[1400px] mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="font-outfit text-5xl md:text-7xl font-bold uppercase text-white mb-12 tracking-wider leading-tight">
                    Silence in a <br />
                    <span className="text-grey-500">Loud World.</span>
                </h1>

                <div className="aspect-video bg-grey-900 w-full mb-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-grey-800 to-black opacity-50" />
                    {/* Placeholder for About Image */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 text-grey-300">
                    <div>
                        <h2 className="text-white font-outfit uppercase tracking-widest text-lg mb-6 border-t border-white/20 pt-4">Story</h2>
                    </div>
                    <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed">
                        <p>
                            Founded in 2024, KSHRA was born from a desire to strip away the unnecessary. In an era of noise and visual clutter, we find solace in the absence of color.
                        </p>
                        <p>
                            We believe that true luxury lies in simplicity. Our collections are designed not to stand out for their loudness, but for their silence. Every stitch, every loose thread, every silhouette is calculated to provide a sense of calm and confidence.
                        </p>
                    </div>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 text-grey-300">
                    <div>
                        <h2 className="text-white font-outfit uppercase tracking-widest text-lg mb-6 border-t border-white/20 pt-4">Philosophy</h2>
                    </div>
                    <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed">
                        <p>
                            Our palette is restricted, but our expression is limitless. By removing color, we force a focus on texture, form, and light. Black is not just a color; it is a statement of intent. White is not emptiness; it is possibility.
                        </p>
                        <p>
                            We design for the modern individual who speaks softly but carries a heavy presence.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
