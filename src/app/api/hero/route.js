import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import crypto from 'crypto';
import { cacheKeyForUrl, redisGetJson, redisSetJson } from '@/lib/redisCache';
import { EDGE_CACHE_CONTROL, withEdgeCacheHeaders } from '@/lib/edgeCache';

function timingSafeEqual(a, b) {
    const ba = Buffer.from(a || '');
    const bb = Buffer.from(b || '');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
}

function signPreviewToken(secret, payload) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const wantDraft = url.searchParams.get('draft') === '1';

        // Cache only published hero payloads.
        if (!wantDraft) {
            const cacheKey = cacheKeyForUrl(request.url);
            const cached = await redisGetJson(cacheKey);
            if (cached) {
                return withEdgeCacheHeaders(NextResponse.json(cached), EDGE_CACHE_CONTROL);
            }
        }

        await dbConnect();
        const settings = await SiteSettings.findOne().lean();

        if (!settings) {
            return NextResponse.json({ heroVariant: 'default', heroDesign: null });
        }

        // url + wantDraft computed above
        const ts = url.searchParams.get('ts') || '';
        const token = url.searchParams.get('token') || '';

        const secret =
            process.env.HERO_PREVIEW_SECRET ||
            process.env.NEXT_PUBLIC_HERO_PREVIEW_SECRET ||
            process.env.NEXTAUTH_SECRET;
        const allowDraft = (() => {
            if (!wantDraft) return false;
            // If no secret is configured, never allow draft.
            if (!secret) return false;
            // If no timestamp, deny.
            if (!ts) return false;
            // 10-minute TTL.
            const tsNum = Number(ts);
            if (!Number.isFinite(tsNum)) return false;
            const ageMs = Math.abs(Date.now() - tsNum);
            if (ageMs > 10 * 60 * 1000) return false;
            const expected = signPreviewToken(secret, `draft:${ts}`);
            return timingSafeEqual(token, expected);
        })();

        const published = settings.heroDesign
            ? {
                version: settings.heroDesign.version || 1,
                publishedAt: settings.heroDesign.publishedAt || null,
                backgrounds: settings.heroDesign.backgrounds || null,
                layouts: settings.heroDesign.layouts || null,
                meta: settings.heroDesign.meta || null,
            }
            : null;

        const draft = (allowDraft && settings.heroDesign?.draft)
            ? {
                version: settings.heroDesign.version || 1,
                publishedAt: settings.heroDesign.publishedAt || null,
                backgrounds: settings.heroDesign.draft.backgrounds || settings.heroDesign.backgrounds || null,
                layouts: settings.heroDesign.draft.layouts || settings.heroDesign.layouts || null,
                meta: settings.heroDesign.meta || null,
                isDraft: true,
            }
            : null;

        const heroDesign = draft || published;

        const payload = { heroVariant: settings.heroVariant || 'default', heroDesign };
        const res = NextResponse.json(payload);

        // Draft preview must never be cached.
        if (wantDraft) {
            res.headers.set('Cache-Control', 'private, no-store');
            return res;
        }

        await redisSetJson(cacheKeyForUrl(request.url), payload, 60);
        return withEdgeCacheHeaders(res, EDGE_CACHE_CONTROL);
    } catch (error) {
        console.error('Error fetching hero design:', error);
        return NextResponse.json({ error: 'Failed to fetch hero design' }, { status: 500 });
    }
}
