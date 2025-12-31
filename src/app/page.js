import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductGrid from '@/components/product/ProductGrid';
import Footer from '@/components/layout/Footer';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { unstable_noStore as noStore } from 'next/cache';

async function getNewArrivals() {
  noStore(); // OPTIONAL: Prevent caching for admin updates visibility
  try {
    await dbConnect();
    // Fetch latest 4 products, assuming 'createdAt' sort or 'isNewProduct' flag
    // Adjust query as needed. Using createdAt desc for "New Arrivals"
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();

    // Convert _id and dates to serializable format if needed (lean() helps but nextjs might complain about ObjectIds)
    return products.map(product => ({
      ...product,
      _id: product._id.toString(),
      id: product._id.toString(), // Ensure 'id' prop exists for compatibility
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
      colors: product.colors?.map(c => ({
        ...c,
        _id: c._id ? c._id.toString() : undefined
      })) || []
    }));
  } catch (error) {
    console.error("Failed to fetch new arrivals:", error);
    return [];
  }
}

export default async function Home() {
  const newArrivals = await getNewArrivals();

  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ProductGrid title="New Arrivals" products={newArrivals} />
      <Footer />
    </>
  );
}
