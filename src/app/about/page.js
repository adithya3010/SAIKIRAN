export default function AboutPage() {
    return (
        <div className="pt-[140px] pb-24 px-4 min-h-screen max-w-[1400px] mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="font-outfit text-5xl md:text-7xl font-bold uppercase text-foreground mb-12 tracking-wider leading-tight">
                    DEFINED BY <br />
                    <span className="text-text-muted">WHAT WE ARE NOT.</span>
                </h1>

                <div className="aspect-video bg-bg-secondary w-full mb-16 relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-tr from-bg-tertiary to-bg-primary opacity-50" />
                    {/* Placeholder for About Image - could use a brand asset here if available */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 text-text-muted">
                    <div>
                        <h2 className="text-foreground font-outfit uppercase tracking-widest text-lg mb-6 border-t border-border-primary pt-4">The Anti-Label</h2>
                    </div>
                    <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed">
                        <p>
                            <span className="text-foreground font-medium">MAY BE NOT</span> is more than a brand; it's a question. In a world demanding definitions, labels, and boxes, we choose ambiguity. We are not just a clothing line. We are not trying to fit in.
                        </p>
                        <p>
                            We specialize in premium, unisex t-shirts that defy categorization. Simple, yet profound. Minimal, yet loud. Our designs are for those who are comfortable in the gray areas, who define themselves by what they refuse to be.
                        </p>
                    </div>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 text-text-muted">
                    <div>
                        <h2 className="text-foreground font-outfit uppercase tracking-widest text-lg mb-6 border-t border-border-primary pt-4">Philosophy</h2>
                    </div>
                    <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed">
                        <p>
                            "Maybe Not" is the power to say no. No to fast fashion. No to gender norms. No to compromise.
                        </p>
                        <p>
                            We craft essentials for the modern individual. Quality is our only non-negotiable. Everything else? <span className="italic">Maybe not.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
