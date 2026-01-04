import { NextResponse } from 'next/server';

export const EDGE_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=120';

export function withEdgeCacheHeaders(response, cacheControl = EDGE_CACHE_CONTROL) {
  response.headers.set('Cache-Control', cacheControl);
  return response;
}

export function jsonWithEdgeCache(data, init = {}, cacheControl = EDGE_CACHE_CONTROL) {
  const res = NextResponse.json(data, init);
  return withEdgeCacheHeaders(res, cacheControl);
}
