"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function useBreakpoint() {
    const [bp, setBp] = useState(() => {
        if (typeof window === 'undefined') return 'desktop';
        const w = window.innerWidth;
        if (w < 640) return 'mobile';
        if (w < 1024) return 'tablet';
        return 'desktop';
    });

    useEffect(() => {
        const compute = () => {
            const w = window.innerWidth;
            if (w < 640) return 'mobile';
            if (w < 1024) return 'tablet';
            return 'desktop';
        };
        const onResize = () => setBp(compute());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return bp;
}

function renderElement(el) {
    const style = {
        position: 'absolute',
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: `${el.width}px`,
        height: `${el.height}px`,
        transform: `rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
        transformOrigin: 'top left',
        zIndex: el.zIndex || 0,
        opacity: el.opacity ?? 1,
        pointerEvents: el.link ? 'auto' : 'none',
        ...((el.style && typeof el.style === 'object') ? el.style : {})
    };

    const content = (() => {
        if (el.type === 'text') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        fontSize: el.fontSize || 48,
                        fontWeight: el.fontWeight || 800,
                        letterSpacing: el.letterSpacing || '-0.02em',
                        lineHeight: el.lineHeight || 1.1,
                        color: el.color || '#ffffff',
                        whiteSpace: el.whiteSpace || 'pre-wrap',
                        ...((el.textStyle && typeof el.textStyle === 'object') ? el.textStyle : {})
                    }}
                >
                    {el.text || ''}
                </div>
            );
        }

        if (el.type === 'image') {
            const objectFit = el.objectFit || 'contain';
            // Use next/image for local assets; fall back to img for remote/unknown.
            const src = el.src || '';
            const isLikelyRemote = /^https?:\/\//i.test(src);

            if (isLikelyRemote) {
                return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt={el.alt || ''}
                        style={{ width: '100%', height: '100%', objectFit }}
                        draggable={false}
                    />
                );
            }

            return (
                <Image
                    src={src}
                    alt={el.alt || ''}
                    fill
                    sizes="100vw"
                    style={{ objectFit }}
                    priority
                    draggable={false}
                />
            );
        }

        if (el.type === 'button') {
            return (
                <button
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: el.borderRadius ?? 10,
                        padding: 0,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        fontSize: el.fontSize || 12,
                        background: el.background || '#e5e5e5',
                        color: el.color || '#000000',
                        border: el.border || 'none',
                        cursor: 'pointer',
                    }}
                >
                    {el.text || 'Button'}
                </button>
            );
        }

        return null;
    })();

    if (!content) return null;

    if (el.link) {
        // Link needs pointer events enabled.
        return (
            <div style={style} key={el.id}>
                <Link href={el.link} style={{ display: 'block', width: '100%', height: '100%' }}>
                    {content}
                </Link>
            </div>
        );
    }

    return (
        <div style={style} key={el.id}>
            {content}
        </div>
    );
}

export default function HeroDesigned({ heroDesign }) {
    const bp = useBreakpoint();

    const canvas = useMemo(() => {
        const fallback = { width: 1440, height: 720 };
        return heroDesign?.meta?.canvas?.[bp] || fallback;
    }, [heroDesign, bp]);

    const layout = useMemo(() => {
        const l = heroDesign?.layouts?.[bp];
        return (l && Array.isArray(l.elements)) ? l : { elements: [] };
    }, [heroDesign, bp]);

    const background = heroDesign?.backgrounds?.[bp] || null;

    // Scale canvas to viewport width, retain aspect.
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const recompute = () => {
            const vw = window.innerWidth;
            const max = Math.min(vw, 1440);
            const next = max / canvas.width;
            setScale(clamp(next, 0.3, 2));
        };
        recompute();
        window.addEventListener('resize', recompute);
        return () => window.removeEventListener('resize', recompute);
    }, [canvas.width]);

    const sectionStyle = {
        position: 'relative',
        width: '100%',
        background: background?.color || '#000000',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 80px)'
    };

    const stageOuterStyle = {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 0'
    };

    const stageStyle = {
        position: 'relative',
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
    };

    return (
        <section style={sectionStyle}>
            {background?.radial && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        backgroundImage: background.radial,
                        opacity: background.opacity ?? 0.8,
                    }}
                />
            )}
            {background?.image?.src && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <Image
                        src={background.image.src}
                        alt={background.image.alt || 'Hero background'}
                        fill
                        priority
                        sizes="100vw"
                        style={{ objectFit: background.image.objectFit || 'cover', opacity: background.image.opacity ?? 0.55 }}
                    />
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={stageOuterStyle}>
                    <div style={stageStyle}>
                        {layout.elements.map(renderElement)}
                    </div>
                </div>
            </div>
        </section>
    );
}
