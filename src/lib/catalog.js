import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import { unstable_cache } from 'next/cache';

function serializeProduct(doc) {
  if (!doc) return null;
  const p = { ...doc };
  const id = p?._id?.toString?.() || p?._id;
  p._id = id;
  p.id = id;
  if (p.createdAt && typeof p.createdAt?.toISOString === 'function') p.createdAt = p.createdAt.toISOString();
  if (p.updatedAt && typeof p.updatedAt?.toISOString === 'function') p.updatedAt = p.updatedAt.toISOString();

  if (Array.isArray(p.colors)) {
    p.colors = p.colors.map((c) => ({
      ...c,
      _id: c?._id?.toString?.() || c?._id,
      images: Array.isArray(c?.images) ? c.images : [],
    }));
  }

  if (Array.isArray(p.variants)) {
    p.variants = p.variants.map((v) => ({
      ...v,
      _id: v?._id?.toString?.() || v?._id,
      color: v?.color
        ? {
            ...v.color,
            _id: v.color?._id?.toString?.() || v.color?._id,
          }
        : v?.color,
    }));
  }

  return p;
}

export const getHomeFeaturedProducts = unstable_cache(
  async () => {
    await dbConnect();
    const products = await Product.find({})
      .select('_id name slug price images category createdAt colors variants')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    return products.map(serializeProduct);
  },
  ['home-featured-products:v1'],
  { revalidate: 60 }
);

export const getProductsByCategory = unstable_cache(
  async (category) => {
    await dbConnect();
    const query = category && category !== 'all'
      ? { category: { $regex: new RegExp(category, 'i') } }
      : {};

    const products = await Product.find(query)
      .select('_id name slug price images category createdAt colors variants')
      .sort({ createdAt: -1 })
      .lean();

    return products.map(serializeProduct);
  },
  ['products-by-category:v1'],
  { revalidate: 300 }
);

export const getProductById = unstable_cache(
  async (id) => {
    await dbConnect();
    const product = await Product.findById(id)
      .select('_id name slug description price images category createdAt colors variants sizes fit fabric printType occasion inStock isNewProduct')
      .lean();
    return serializeProduct(product);
  },
  ['product-by-id:v1'],
  { revalidate: 300 }
);

export const getRecommendedProducts = unstable_cache(
  async ({ category, currentId }) => {
    await dbConnect();
    const products = await Product.find({
      category,
      _id: { $ne: currentId },
    })
      .select('_id name slug price images category createdAt colors variants')
      .limit(4)
      .lean();
    return products.map(serializeProduct);
  },
  ['recommended-products:v1'],
  { revalidate: 300 }
);

export const getSiteSettingsCached = unstable_cache(
  async () => {
    await dbConnect();
    const settings = await SiteSettings.findOne().lean();
    if (!settings) return { heroVariant: 'default' };
    return {
      ...settings,
      _id: settings?._id?.toString?.() || settings?._id,
    };
  },
  ['site-settings:v1'],
  { revalidate: 60 }
);
