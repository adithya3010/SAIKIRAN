export function reportWebVitals(metric) {
  // Lightweight client-side Web Vitals logging.
  // In production, forward these to an analytics endpoint (Vercel Analytics, Logtail, etc.).
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[WebVitals]', metric);
  }
}
