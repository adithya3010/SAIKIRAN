import Link from 'next/link';

const collections = [
    { id: 1, title: 'Men\'s Collection', href: '/shop/men', gradient: 'bg-gradient-to-tr from-[#111] to-[#333]' },
    { id: 2, title: 'Women\'s Collection', href: '/shop/women', gradient: 'bg-gradient-to-tr from-[#222] to-[#444]' },
    { id: 3, title: 'Accessories', href: '/shop/accessories', gradient: 'bg-gradient-to-tr from-[#050505] to-[#222]' },
];

export default function FeaturedCollections() {
    return (
        <section className="py-24 px-4 max-w-[1400px] mx-auto">
            <h2 className="font-outfit text-3xl font-semibold uppercase mb-8 text-white tracking-widest">Curated Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {collections.map((item) => (
                    <Link key={item.id} href={item.href} className="group relative block overflow-hidden aspect-[3/4] border border-border-secondary">
                        <div className={`w-full h-full ${item.gradient} transition-transform duration-700 group-hover:scale-105`}>
                            {/* Image would go here */}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end translate-y-0 pb-6 transition-all duration-300">
                            <h3 className="text-2xl font-medium text-white mb-1">{item.title}</h3>
                            <span className="text-sm uppercase tracking-widest text-grey-400 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                Explore &rarr;
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
