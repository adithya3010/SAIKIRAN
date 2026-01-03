import Hero from '@/components/home/Hero';
import HeroCreative from '@/components/home/HeroCreative';
import HeroVideo from '@/components/home/HeroVideo';
import HeroModern from '@/components/home/HeroModern';
import HeroDesigned from '@/components/home/HeroDesigned';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductGrid from '@/components/product/ProductGrid';
import Footer from '@/components/layout/Footer';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings'; // Import Settings model
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';

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

async function getSiteSettings() {
  noStore();
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne();
    return settings || { heroVariant: 'default' };
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return { heroVariant: 'default' };
  }
}

async function getPublishedHeroDesign() {
  noStore();
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const base = host ? `${proto}://${host}` : '';
    const res = await fetch(`${base}/api/hero`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.heroDesign || null;
  } catch {
    return null;
  }
}

async function getHeroDesignMaybeDraft({ heroDraft, ts, token }) {
  noStore();
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const base = host ? `${proto}://${host}` : '';

    const qs = heroDraft && ts && token
      ? `?draft=1&ts=${encodeURIComponent(ts)}&token=${encodeURIComponent(token)}`
      : '';

    const res = await fetch(`${base}/api/hero${qs}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.heroDesign || null;
  } catch {
    return null;
  }
}

export default async function Home({ searchParams }) {
  const newArrivals = await getNewArrivals();
  const settings = await getSiteSettings();
  const sp = await searchParams;
  const heroDraft = sp?.heroDraft === '1';
  const ts = sp?.ts;
  const token = sp?.token;
  const heroDesign = settings?.heroVariant === 'designed'
    ? await getHeroDesignMaybeDraft({ heroDraft, ts, token })
    : null;

  /*
   * Hero Selection Logic:
   * 1 -> default -> Hero
   * 2 -> creative -> HeroCreative
   * 3 -> video -> HeroCinematic
   */
  let HeroComponent;
  switch (settings.heroVariant) {
    case 'creative':
      HeroComponent = HeroCreative;
      break;
    case 'video':
      HeroComponent = HeroVideo;
      break;
    case 'modern':
      HeroComponent = HeroModern;
      break;
    case 'designed':
      HeroComponent = HeroDesigned;
      break;
    default:
      HeroComponent = Hero;
  }

  return (
    <>
      {settings.heroVariant === 'designed' ? <HeroComponent heroDesign={heroDesign} /> : <HeroComponent />}
      <FeaturedCollections />
      <ProductGrid title="New Arrivals" products={newArrivals} />
      <Footer />
    </>
  );
}
