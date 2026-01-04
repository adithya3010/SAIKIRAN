# Performance checklist (after deployment)

This project is a Next.js (App Router) + MongoDB/Mongoose storefront.

## 1) CDN + caching (biggest win)

### Vercel setup (recommended)
- **Deploy region**: choose the closest region to your MongoDB Atlas cluster.
- **Edge caching**: Vercel respects `Cache-Control` on Route Handlers. Use `s-maxage` + `stale-while-revalidate` for public GET APIs.
- **ISR vs SSR**:
  - Prefer static (`○`) pages when possible.
  - Use server rendering (`ƒ`) only where data truly must be fresh per-request.

### Cache the public hero API
- The route `src/app/api/hero/route.js` now sends:
  - Published: `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`
  - Draft preview: `Cache-Control: private, no-store`

If you deploy to Vercel/Cloudflare/Azure Front Door, this enables edge caching for the published hero.

### Cache other public GET APIs
Apply the same pattern to:
- `src/app/api/products/route.js`
- `src/app/api/products/[id]/route.js`
- `src/app/api/orders/...` only if it is public (usually NOT).

Rule of thumb:
- Public catalog data: `s-maxage=60..300, stale-while-revalidate=600..3600`
- User-specific/auth/admin: `private, no-store`

## 2) Images (largest bandwidth win)

### Avoid quality=100
`next.config.mjs` now prefers `qualities: [60, 75, 85]` and modern formats (`avif`, `webp`).

### Always provide `sizes` for `fill`
For `<Image fill />`, set `sizes` so the browser doesn’t download bigger-than-needed images.

### Keep hero images small
- Export hero backgrounds at 2x max of their display size.
- Use WebP/AVIF.
- Prefer CSS gradients and subtle textures over huge bitmaps.

## 3) Fonts
You already use `next/font` with `display: "swap"`. Keep it that way.

## 4) Reduce client JS
Quick wins:
- Keep pages as Server Components, add `'use client'` only where needed.
- Ensure big admin-only components are not imported by public pages.
- Split heavy UI (e.g., designer) to admin routes only.

If you want bundle sizes:
- Add `@next/bundle-analyzer` and enable it for `next build`.

## 5) MongoDB performance + stability
`src/lib/db.js` uses a cached connection and now includes:
- Pooling via `maxPoolSize/minPoolSize`
- `compressors: ['zlib']`

Recommended deployment settings:
- Use MongoDB Atlas near your compute region.
- Add indexes on frequently-filtered fields (category, createdAt, price, etc.).

## 6) Monitoring / budgets

### Measure real user performance
- Enable Web Vitals reporting (and track LCP/INP/CLS).
- Add basic uptime + API latency checks.

### Budget targets
- LCP < 2.5s on 4G
- INP < 200ms
- CLS < 0.1

## Suggested env vars

For DB pooling (optional):
- `MONGODB_MAX_POOL_SIZE=10`
- `MONGODB_MIN_POOL_SIZE=0`

## Upstash Redis (cache + checkout queue)

This app supports Upstash Redis for:
- **URL-keyed caching** of public GET APIs (`/api/products`, `/api/products/[id]`, `/api/hero`) for **60s**
- A **checkout queue** so `/api/orders` (POST) returns fast and a worker processes DB writes + email

Required env vars:
- `UPSTASH_REDIS_REST_URL=...`
- `UPSTASH_REDIS_REST_TOKEN=...`

Worker protection:
- `CHECKOUT_WORKER_SECRET=<long random>`

### Triggering the worker (no extra infra)

Deploy a scheduled trigger (recommended via Vercel Cron in the dashboard) to call:
- `GET /api/worker/checkout?secret=<CHECKOUT_WORKER_SECRET>&max=10`

This keeps the queue draining in the background without running servers.

For Vercel production:
- `NEXTAUTH_URL=https://<your-domain>`
- `NEXTAUTH_SECRET=<long random>`
- `MONGODB_URI=<atlas uri>`
- `HERO_PREVIEW_SECRET=<long random>`
- `NEXT_PUBLIC_APP_URL=https://<your-domain>`

## Bundle inspection

Run bundle analyzer locally:

```powershell
npm install
npm run analyze
```

This helps you spot large client-only dependencies and move them to Server Components or lazy-load them.

