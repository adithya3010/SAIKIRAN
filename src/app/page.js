import Hero from '@/components/home/Hero';
import HeroCreative from '@/components/home/HeroCreative';
import HeroVideo from '@/components/home/HeroVideo';
import HeroModern from '@/components/home/HeroModern';
import HeroDesigned from '@/components/home/HeroDesigned';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductGrid from '@/components/product/ProductGrid';
import Footer from '@/components/layout/Footer';
import { getHomeFeaturedProducts, getSiteSettingsCached } from '@/lib/catalog';
import { unstable_noStore as noStore } from 'next/cache';

export const runtime = 'nodejs';
export const revalidate = 60;

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const heroDraft = sp?.heroDraft === '1';
  const ts = sp?.ts;
  const token = sp?.token;

  // Allow caching for normal public traffic; bypass caching for draft preview.
  if (heroDraft && ts && token) {
    noStore();
  }

  const newArrivals = await getHomeFeaturedProducts();
  const settings = await getSiteSettingsCached();

  // Edge runtime cannot support the crypto-based draft preview token verification.
  // Keep homepage fast via ISR + Edge by rendering published design only.
  const hasPublishedDesign = Boolean(settings?.heroDesign?.layouts || settings?.heroDesign?.backgrounds);
  const heroDesign = settings?.heroVariant === 'designed' && hasPublishedDesign
    ? {
        version: settings?.heroDesign?.version || 1,
        publishedAt: settings?.heroDesign?.publishedAt || null,
        backgrounds: settings?.heroDesign?.backgrounds || null,
        layouts: settings?.heroDesign?.layouts || null,
        meta: settings?.heroDesign?.meta || null,
      }
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
