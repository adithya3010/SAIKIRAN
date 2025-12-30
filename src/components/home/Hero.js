import Link from 'next/link';
import Button from '../ui/Button';

export default function Hero() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden pt-[80px]">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(20,20,20,1)_0%,transparent_50%)]" />

            <div className="relative z-10 text-center max-w-[800px] px-4 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <h1 className="font-outfit text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1.1] uppercase mb-6 text-white tracking-[-0.02em]">
                    Redefine <br />
                    <span className="text-transparent [-webkit-text-stroke:1px_white] opacity-80">Your Shadow</span>
                </h1>
                <p className="text-lg text-grey-400 mb-12 max-w-[600px] mx-auto leading-relaxed">
                    Premium monochrome essentials for the modern avant-garde.
                    Engineered for silence and precision.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center px-8 md:px-0">
                    <Link href="/shop/men">
                        <Button size="lg" variant="solid" className="w-full md:w-auto">Shop Men</Button>
                    </Link>
                    <Link href="/shop/women">
                        <Button size="lg" variant="outline" className="w-full md:w-auto">Shop Women</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
