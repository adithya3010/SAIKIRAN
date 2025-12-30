import Button from '../ui/Button';
import Link from 'next/link';

export default function ProductCard({ product }) {
    return (
        <Link href={`/product/${product.id}`} className="group relative cursor-pointer block">
            <div className="relative w-full aspect-[3/4] bg-grey-100 overflow-hidden mb-2">
                {/* Placeholder for Product Image */}
                <div className="w-full h-full bg-gradient-to-b from-grey-800 to-black transition-transform duration-500Group group-hover:scale-105" />

                <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-2 transition-all duration-300 flex justify-center group-hover:opacity-100 group-hover:translate-y-0">
                    <Button variant="solid" size="sm" className="w-full">
                        Quick Add
                    </Button>
                </div>
                {product.isNew && (
                    <span className="absolute top-2 left-2 bg-white text-black px-2 py-1 text-xs font-semibold uppercase tracking-wider">
                        New
                    </span>
                )}
            </div>
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-normal text-white mb-1 group-hover:text-grey-300 transition-colors">{product.name}</h3>
                <p className="text-sm font-semibold text-grey-400">₹{product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
}
