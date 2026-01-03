/** @type {import('next').NextConfig} */
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Prefer smaller encodes; 100 quality is rarely worth the bytes.
    qualities: [60, 75, 85],
    formats: ['image/avif', 'image/webp'],
    // Encourage CDN caching for optimized images.
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
};

export default withBundleAnalyzer(nextConfig);
