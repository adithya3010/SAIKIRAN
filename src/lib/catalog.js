import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import { unstable_cache } from 'next/cache';
import { redisGetJson, redisSetJson } from '@/lib/redisCache';

async function withRedisTtlCache(key, ttlSeconds, fn) {
  const cached = await redisGetJson(key);
  if (cached) return cached;
  const value = await fn();
  await redisSetJson(key, value, ttlSeconds);
  return value;
}

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

const _getHomeFeaturedProducts = unstable_cache(
  async () => {
    await dbConnect();
    const t0 = Date.now();
    const products = await Product.find({})
      .select('_id name slug price images category createdAt colors variants')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    const ms = Date.now() - t0;
    if (ms > 250) console.warn('Slow Mongo query getHomeFeaturedProducts:', { ms });
    return products.map(serializeProduct);
  },
  ['home-featured-products:v1'],
  { revalidate: 60 }
);

export async function getHomeFeaturedProducts() {
  return withRedisTtlCache('catalog:v1:home-featured-products', 60, _getHomeFeaturedProducts);
}

const _getProductsByCategory = unstable_cache(
  async (category) => {
    await dbConnect();
    const query = category && category !== 'all'
      ? { category: { $regex: new RegExp(category, 'i') } }
      : {};

    const t0 = Date.now();
    const products = await Product.find(query)
      .select('_id name slug price images category createdAt colors variants')
      .sort({ createdAt: -1 })
      .lean();
    const ms = Date.now() - t0;
    if (ms > 250) console.warn('Slow Mongo query getProductsByCategory:', { ms, category });

    return products.map(serializeProduct);
  },
  ['products-by-category:v1'],
  { revalidate: 300 }
);

export async function getProductsByCategory(category) {
  return withRedisTtlCache(`catalog:v1:products-by-category:${String(category || 'all')}`, 60, () => _getProductsByCategory(category));
}

const _getProductById = unstable_cache(
  async (id) => {
    await dbConnect();
    const t0 = Date.now();
    const product = await Product.findById(id)
      .select('_id name slug description price images category createdAt colors variants sizes fit fabric printType occasion inStock isNewProduct')
      .lean();
    const ms = Date.now() - t0;
    if (ms > 250) console.warn('Slow Mongo query getProductById:', { ms, id });
    return serializeProduct(product);
  },
  ['product-by-id:v1'],
  { revalidate: 300 }
);

export async function getProductById(id) {
  return withRedisTtlCache(`catalog:v1:product-by-id:${String(id)}`, 60, () => _getProductById(id));
}

const _getRecommendedProducts = unstable_cache(
  async ({ category, currentId }) => {
    await dbConnect();
    const t0 = Date.now();
    const products = await Product.find({
      category,
      _id: { $ne: currentId },
    })
      .select('_id name slug price images category createdAt colors variants')
      .limit(4)
      .lean();
    const ms = Date.now() - t0;
    if (ms > 250) console.warn('Slow Mongo query getRecommendedProducts:', { ms, category });
    return products.map(serializeProduct);
  },
  ['recommended-products:v1'],
  { revalidate: 300 }
);

export async function getRecommendedProducts({ category, currentId }) {
  return withRedisTtlCache(
    `catalog:v1:recommended:${String(category)}:${String(currentId)}`,
    60,
    () => _getRecommendedProducts({ category, currentId })
  );
}

const _getSiteSettingsCached = unstable_cache(
  async () => {
    await dbConnect();
    const t0 = Date.now();
    const settings = await SiteSettings.findOne().lean();
    const ms = Date.now() - t0;
    if (ms > 250) console.warn('Slow Mongo query getSiteSettingsCached:', { ms });
    if (!settings) return { heroVariant: 'default' };
    return {
      ...settings,
      _id: settings?._id?.toString?.() || settings?._id,
    };
  },
  ['site-settings:v1'],
  { revalidate: 60, tags: ['site-settings'] }
);

export async function getSiteSettingsCached() {
  return withRedisTtlCache('catalog:v1:site-settings', 60, _getSiteSettingsCached);
}
