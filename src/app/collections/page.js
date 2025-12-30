import Link from 'next/link';
import { collections } from '@/lib/data';

export default function CollectionsPage() {
    return (
        <div className="pt-[120px] pb-24 px-4 max-w-[1400px] mx-auto min-h-screen">
            <h1 className="font-outfit text-4xl md:text-5xl font-bold uppercase text-white mb-12 tracking-wider text-center">Collections</h1>

            <div className="grid grid-cols-1 gap-6 md:gap-8">
                {collections.map((collection) => (
                    <Link key={collection.id} href={collection.href} className="group relative block w-full aspect-[4/5] md:aspect-[3/1] border border-border-secondary overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-grey-900 via-grey-800 to-black transition-transform duration-700 group-hover:scale-105" />

                        <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-start md:items-center z-10 p-8 md:p-12 text-left md:text-center bg-gradient-to-t from-black/80 to-transparent md:bg-none">
                            <h2 className="font-outfit text-4xl md:text-5xl font-bold uppercase text-white mb-2 md:mb-4 tracking-wider md:tracking-[0.2em] leading-none">{collection.title}</h2>
                            <p className="text-grey-300 md:text-grey-400 text-base md:text-lg max-w-md mb-6 md:mb-8 opacity-90 md:opacity-80 font-light">{collection.description}</p>
                            <span className="inline-block px-6 py-3 md:px-8 md:py-3 border border-white text-white text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                Explore
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
