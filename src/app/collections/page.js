import Link from 'next/link';
import { collections } from '@/lib/data';

export default function CollectionsPage() {
    return (
        <div className="pt-[120px] pb-24 px-4 max-w-[1400px] mx-auto min-h-screen">
            <h1 className="font-outfit text-4xl md:text-5xl font-bold uppercase text-white mb-12 tracking-wider text-center">Collections</h1>

            <div className="grid grid-cols-1 gap-8">
                {collections.map((collection) => (
                    <Link key={collection.id} href={collection.href} className="group relative block w-full aspect-[2/1] md:aspect-[3/1] border border-border-secondary overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-grey-900 via-grey-800 to-black transition-transform duration-700 group-hover:scale-105" />

                        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-8 text-center">
                            <h2 className="font-outfit text-3xl md:text-4xl font-semibold uppercase text-white mb-4 tracking-[0.2em]">{collection.title}</h2>
                            <p className="text-grey-400 text-lg max-w-md mb-8 opacity-80">{collection.description}</p>
                            <span className="inline-block px-8 py-3 border border-white text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                View Collection
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
