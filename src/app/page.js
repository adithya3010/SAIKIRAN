import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductGrid from '@/components/product/ProductGrid';
import Footer from '@/components/layout/Footer';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { unstable_noStore as noStore } from 'next/cache';

async function getNewArrivals() {
  noStore();
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();

    // Manually serialize the result
    return products.map(product => {
      // Create a shallow copy first
      const serialized = { ...product };

      // Convert _id to string
      if (serialized._id) {
        serialized._id = serialized._id.toString();
        serialized.id = serialized._id; // Ensure compatibility
      }

      // Convert Date fields
      if (serialized.createdAt) serialized.createdAt = serialized.createdAt.toISOString();
      if (serialized.updatedAt) serialized.updatedAt = serialized.updatedAt.toISOString();

      // Serialize nested ObjectIds in colors array
      if (serialized.colors) {
        serialized.colors = serialized.colors.map(c => ({
          ...c,
          _id: c._id ? c._id.toString() : undefined
        }));
      }

      // Serialize nested ObjectIds in variants array (Mongoose might add _id to subdocs)
      if (serialized.variants) {
        serialized.variants = serialized.variants.map(v => ({
          ...v,
          _id: v._id ? v._id.toString() : undefined,
          color: v.color ? { ...v.color, _id: v.color._id ? v.color._id.toString() : undefined } : v.color
        }));
      }

      return serialized;
    });
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
