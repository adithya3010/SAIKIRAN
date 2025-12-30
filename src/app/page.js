import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductGrid from '@/components/product/ProductGrid';
import Footer from '@/components/layout/Footer';
import { products } from '@/lib/data';

export default function Home() {
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ProductGrid title="New Arrivals" products={newArrivals} />
      <Footer />
    </>
  );
}
