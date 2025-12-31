import ProductCard from './ProductCard';

export default function ProductGrid({ title, products }) {
    return (
        <section className="py-24 px-4 max-w-[1400px] mx-auto">
            <div className="mb-12 flex justify-between items-end">
                <h2 className="font-outfit text-3xl font-semibold uppercase text-foreground tracking-widest">{title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
