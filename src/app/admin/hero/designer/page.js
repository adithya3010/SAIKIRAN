"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { HERO_TEMPLATES, HERO_CANVAS_PRESETS } from '@/lib/heroTemplates';

async function sha256Hex(input) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(key, message) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const h = String(hex).replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  if (full.length !== 6) return { r: 0, g: 0, b: 0 };
  const n = parseInt(full, 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, a = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function buildGradientCss(bg) {
  if (!bg) return '';
  const type = bg.gradientType;
  if (!type || type === 'none') return '';
  const from = bg.gradientFrom || '#404040';
  const to = bg.gradientTo || '#000000';
  const angle = Number.isFinite(Number(bg.gradientAngle)) ? Number(bg.gradientAngle) : 135;
  if (type === 'linear') return `linear-gradient(${angle}deg, ${from}, ${to})`;
  // radial
  return `radial-gradient(circle at 80% 50%, ${from} 0%, ${to} 80%)`;
}

const DEFAULT_DESIGN = {
  version: 1,
  meta: { canvas: HERO_CANVAS_PRESETS },
  backgrounds: {
    desktop: { color: '#000000', radial: 'radial-gradient(circle at 80% 50%, #404040 0%, #1a1a1a 40%, #000000 80%)', opacity: 0.8 },
    tablet: { color: '#000000', radial: 'radial-gradient(circle at 80% 50%, #404040 0%, #1a1a1a 40%, #000000 80%)', opacity: 0.8 },
    mobile: { color: '#000000', radial: 'radial-gradient(circle at 80% 50%, #404040 0%, #1a1a1a 40%, #000000 80%)', opacity: 0.8 },
  },
  layouts: {
    desktop: { elements: [] },
    tablet: { elements: [] },
    mobile: { elements: [] },
  },
  draft: {
    layouts: {
      desktop: { elements: [] },
      tablet: { elements: [] },
      mobile: { elements: [] },
    },
    backgrounds: {
      desktop: null,
      tablet: null,
      mobile: null,
    },
  },
};

function renderElementPreview(el) {
  if (el.type === 'text') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          fontSize: el.fontSize || 48,
          fontWeight: el.fontWeight || 800,
          lineHeight: el.lineHeight || 1.1,
          color: el.color || '#ffffff',
          whiteSpace: 'pre-wrap',
          pointerEvents: 'none',
        }}
      >
        {el.text || ''}
      </div>
    );
  }
  if (el.type === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={el.src || ''} alt={el.alt || ''} style={{ width: '100%', height: '100%', objectFit: el.objectFit || 'contain', pointerEvents: 'none' }} />;
  }
  if (el.type === 'button') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: el.borderRadius ?? 10,
          background: el.background || '#e5e5e5',
          border: el.border || 'none',
          color: el.color || '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: el.fontSize || 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        {el.text || 'Button'}
      </div>
    );
  }
  return null;
}

export default function HeroDesignerAdminPage() {
  const [bp, setBp] = useState('desktop');
  const [settings, setSettings] = useState(null);
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [grid, setGrid] = useState(8);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('/');

  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const clipboardRef = useRef(null);
  const nudgeLockRef = useRef(false);
  const autosaveTimerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await res.json();
      setSettings(data);
      const initial = data?.heroDesign || DEFAULT_DESIGN;
      // Ensure draft exists
      const next = {
        ...deepClone(DEFAULT_DESIGN),
        ...deepClone(initial),
      };
      setDesign(next);
    };
    load();
  }, []);

  // Build a signed preview URL that requests draft hero from /api/hero.
  useEffect(() => {
    // Set a baseline so the button isn't empty; we generate a fresh link on click.
    setPreviewUrl('/');
  }, []);

  const openPreview = async () => {
    const secret = process.env.NEXT_PUBLIC_HERO_PREVIEW_SECRET;
    if (!secret) {
      window.open('/', '_blank', 'noreferrer');
      return;
    }
    const ts = Date.now().toString();
    const msg = `draft:${ts}`;
    const token = await hmacSha256Hex(secret, msg);
    const url = `/?heroDraft=1&ts=${ts}&token=${token}`;
    setPreviewUrl(url);
    window.open(url, '_blank', 'noreferrer');
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const canvas = useMemo(() => design?.meta?.canvas?.[bp] || HERO_CANVAS_PRESETS[bp], [design, bp]);
  const background = useMemo(() => {
    const bg = design?.draft?.backgrounds?.[bp] || design?.backgrounds?.[bp] || null;
    return bg;
  }, [design, bp]);
  const layout = useMemo(() => {
    const l = design?.draft?.layouts?.[bp] || design?.layouts?.[bp] || { elements: [] };
    if (!Array.isArray(l.elements)) return { elements: [] };
    return l;
  }, [design, bp]);

  const elements = layout.elements;
  const selected = elements.find(e => e.id === selectedId) || null;

  // Keyboard shortcuts: arrows nudge, delete, duplicate (Ctrl/Cmd+D), copy/paste.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (nudgeLockRef.current) return;
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'd' && selected) {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c' && selected) {
        e.preventDefault();
        clipboardRef.current = deepClone(selected);
        pushToast('Copied');
        return;
      }
      if (mod && e.key.toLowerCase() === 'v' && clipboardRef.current) {
        e.preventDefault();
        pasteClipboard();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected) {
          e.preventDefault();
          deleteSelected();
        }
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (!selected) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        updateSelected({
          x: clamp((selected.x || 0) + dx, 0, canvas.width - 8),
          y: clamp((selected.y || 0) + dy, 0, canvas.height - 8),
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, canvas.width, canvas.height]);

  const setElements = (updater) => {
    setDesign(prev => {
      const next = deepClone(prev);
      if (!next.draft) next.draft = { layouts: {}, backgrounds: {} };
      if (!next.draft.layouts) next.draft.layouts = {};
      if (!next.draft.layouts[bp]) next.draft.layouts[bp] = { elements: [] };
      const current = next.draft.layouts[bp].elements || [];
      const updated = typeof updater === 'function' ? updater(current) : updater;
      next.draft.layouts[bp].elements = updated;
      next.draft.updatedAt = new Date().toISOString();
      return next;
    });
  };

  const pushToast = (msg) => setToast(msg);

  const snap = (v) => {
    if (!snapEnabled) return v;
    return Math.round(v / grid) * grid;
  };

  const addText = () => {
    const id = uuid();
    setElements(curr => ([
      ...curr,
      {
        id,
        type: 'text',
        x: 80,
        y: 80,
        width: 480,
        height: 140,
        text: 'New Text',
        fontSize: 48,
        fontWeight: 900,
        lineHeight: 1.05,
        color: '#ffffff',
        zIndex: (Math.max(0, ...curr.map(e => e.zIndex || 0)) + 1),
      }
    ]));
    setSelectedId(id);
  };

  const addButton = () => {
    const id = uuid();
    setElements(curr => ([
      ...curr,
      {
        id,
        type: 'button',
        x: 80,
        y: 260,
        width: 180,
        height: 52,
        text: 'Button',
        link: '/shop',
        background: '#e5e5e5',
        color: '#000000',
        borderRadius: 10,
        zIndex: (Math.max(0, ...curr.map(e => e.zIndex || 0)) + 1),
      }
    ]));
    setSelectedId(id);
  };

  const addImage = () => {
    setShowImagePicker(true);
  };

  const addImageWithSrc = (src) => {
    if (!src) return;
    const id = uuid();
    setElements(curr => ([
      ...curr,
      {
        id,
        type: 'image',
        x: 720,
        y: 100,
        width: 520,
        height: 520,
        src,
        objectFit: 'contain',
        zIndex: (Math.max(0, ...curr.map(e => e.zIndex || 0)) + 1),
      }
    ]));
    setSelectedId(id);
    setShowImagePicker(false);
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Upload failed');
      setUploadedUrls(prev => [data.url, ...prev].slice(0, 12));
      addImageWithSrc(data.url);
      pushToast('Image uploaded');
    } catch (e) {
      console.error(e);
      pushToast('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(curr => curr.filter(e => e.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = deepClone(selected);
    copy.id = uuid();
    copy.x = clamp((copy.x || 0) + 12, 0, canvas.width - 8);
    copy.y = clamp((copy.y || 0) + 12, 0, canvas.height - 8);
    copy.zIndex = (Math.max(0, ...elements.map(e => e.zIndex || 0)) + 1);
    setElements(curr => ([...curr, copy]));
    setSelectedId(copy.id);
    pushToast('Duplicated');
  };

  const pasteClipboard = () => {
    const src = clipboardRef.current;
    if (!src) return;
    const copy = deepClone(src);
    copy.id = uuid();
    copy.x = clamp((copy.x || 0) + 16, 0, canvas.width - 8);
    copy.y = clamp((copy.y || 0) + 16, 0, canvas.height - 8);
    copy.zIndex = (Math.max(0, ...elements.map(e => e.zIndex || 0)) + 1);
    setElements(curr => ([...curr, copy]));
    setSelectedId(copy.id);
    pushToast('Pasted');
  };

  const layerUp = () => {
    if (!selected) return;
    setElements(curr => curr.map(e => (e.id === selected.id ? { ...e, zIndex: (e.zIndex || 0) + 1 } : e)));
  };
  const layerDown = () => {
    if (!selected) return;
    setElements(curr => curr.map(e => (e.id === selected.id ? { ...e, zIndex: (e.zIndex || 0) - 1 } : e)));
  };

  const onStagePointerDown = (e) => {
    // Deselect when clicking empty background.
    if (e.target === stageRef.current) {
      setSelectedId(null);
    }
  };

  const getStagePoint = (clientX, clientY) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    // Stage is scaled by zoom.
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom };
  };

  const startDrag = (el, e) => {
    e.stopPropagation();
    setSelectedId(el.id);
    const p = getStagePoint(e.clientX, e.clientY);
    dragRef.current = {
      id: el.id,
      startX: p.x,
      startY: p.y,
      origX: el.x,
      origY: el.y,
    };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', stopDrag);
  };

  const onDragMove = (e) => {
    const ref = dragRef.current;
    if (!ref) return;
    const p = getStagePoint(e.clientX, e.clientY);
    const dx = p.x - ref.startX;
    const dy = p.y - ref.startY;
    setElements(curr => curr.map(el => {
      if (el.id !== ref.id) return el;
      const nx = clamp(snap(ref.origX + dx), 0, canvas.width - 8);
      const ny = clamp(snap(ref.origY + dy), 0, canvas.height - 8);
      return { ...el, x: nx, y: ny };
    }));
  };
  const stopDrag = () => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', stopDrag);
  };

  const startResize = (el, corner, e) => {
    e.stopPropagation();
    setSelectedId(el.id);
    const p = getStagePoint(e.clientX, e.clientY);
    resizeRef.current = {
      id: el.id,
      corner,
      startX: p.x,
      startY: p.y,
      orig: { x: el.x, y: el.y, w: el.width, h: el.height }
    };
    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', stopResize);
  };

  const onResizeMove = (e) => {
    const ref = resizeRef.current;
    if (!ref) return;
    const p = getStagePoint(e.clientX, e.clientY);
    const dx = p.x - ref.startX;
    const dy = p.y - ref.startY;

    setElements(curr => curr.map(el => {
      if (el.id !== ref.id) return el;
      let x = ref.orig.x;
      let y = ref.orig.y;
      let w = ref.orig.w;
      let h = ref.orig.h;

      if (ref.corner.includes('e')) w = clamp(snap(ref.orig.w + dx), 24, canvas.width);
      if (ref.corner.includes('s')) h = clamp(snap(ref.orig.h + dy), 24, canvas.height);
      if (ref.corner.includes('w')) {
        w = clamp(snap(ref.orig.w - dx), 24, canvas.width);
        x = clamp(snap(ref.orig.x + dx), 0, canvas.width - 24);
      }
      if (ref.corner.includes('n')) {
        h = clamp(snap(ref.orig.h - dy), 24, canvas.height);
        y = clamp(snap(ref.orig.y + dy), 0, canvas.height - 24);
      }
      return { ...el, x, y, width: w, height: h };
    }));
  };
  const stopResize = () => {
    resizeRef.current = null;
    window.removeEventListener('pointermove', onResizeMove);
    window.removeEventListener('pointerup', stopResize);
  };

  const applyTemplate = (templateId) => {
    const t = HERO_TEMPLATES.find(x => x.id === templateId);
    if (!t) return;
    const next = deepClone(DEFAULT_DESIGN);
    next.version = t.version || 1;
    next.meta = t.meta || next.meta;
    next.backgrounds = t.backgrounds || next.backgrounds;
    next.layouts = t.layouts || next.layouts;
    // Put into draft so it can be edited immediately.
    next.draft = {
      layouts: deepClone(t.layouts || next.layouts),
      backgrounds: deepClone(t.backgrounds || next.backgrounds),
      updatedAt: new Date().toISOString(),
    };
    setDesign(next);
    setSelectedId(null);
    pushToast('Template applied');
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = {
        saveHeroDesignDraft: {
          layouts: design?.draft?.layouts || {},
          backgrounds: design?.draft?.backgrounds || {},
        }
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let details = '';
        try {
          details = await res.text();
        } catch {
          // ignore
        }
        throw new Error(`Save failed (${res.status}) ${details}`);
      }
      pushToast('Draft saved');
    } catch (e) {
      console.error(e);
      pushToast('Draft save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const autoSaveDraftDebounced = () => {
    if (!autoSave) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const payload = {
          saveHeroDesignDraft: {
            layouts: design?.draft?.layouts || {},
            backgrounds: design?.draft?.backgrounds || {},
          }
        };
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          let details = '';
          try {
            details = await res.text();
          } catch {
            // ignore
          }
          throw new Error(`Autosave failed (${res.status}) ${details}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAutoSaving(false);
      }
    }, 650);
  };

  // Trigger autosave after design changes.
  useEffect(() => {
    if (!settings) return;
    autoSaveDraftDebounced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, bp, autoSave]);

  const publish = async () => {
    setIsPublishing(true);
    try {
      const publishPayload = {
        version: design.version || 1,
        meta: design.meta,
        layouts: design?.draft?.layouts || design.layouts,
        backgrounds: design?.draft?.backgrounds || design.backgrounds,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishHeroDesign: publishPayload })
      });
      if (!res.ok) throw new Error('Publish failed');

      // Refresh settings
      const fresh = await (await fetch('/api/admin/settings', { cache: 'no-store' })).json();
      setSettings(fresh);
      setDesign(prev => ({
        ...prev,
        layouts: publishPayload.layouts,
        backgrounds: publishPayload.backgrounds,
      }));
      pushToast('Published live');
    } catch (e) {
      console.error(e);
      pushToast('Publish failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const updateSelected = (patch) => {
    if (!selected) return;
    setElements(curr => curr.map(e => (e.id === selected.id ? { ...e, ...patch } : e)));
  };

  const updateBackground = (patch) => {
    setDesign(prev => {
      const next = deepClone(prev);
      if (!next.draft) next.draft = { layouts: {}, backgrounds: {} };
      if (!next.draft.backgrounds) next.draft.backgrounds = {};
      const base = next.draft.backgrounds[bp] || next.backgrounds?.[bp] || {};
      const merged = { ...base, ...patch };
      // Keep legacy `radial` in sync if user is using structured gradient fields.
      if (Object.prototype.hasOwnProperty.call(patch, 'gradientType') ||
          Object.prototype.hasOwnProperty.call(patch, 'gradientFrom') ||
          Object.prototype.hasOwnProperty.call(patch, 'gradientTo') ||
          Object.prototype.hasOwnProperty.call(patch, 'gradientAngle')) {
        merged.radial = buildGradientCss(merged);
      }
      next.draft.backgrounds[bp] = merged;
      next.draft.updatedAt = new Date().toISOString();
      return next;
    });
  };

  return (
    <div className="p-6 md:p-10 mb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-outfit font-bold uppercase mb-1">Hero Designer</h1>
          <p className="text-grey-400">Design a pixel-perfect hero for desktop, tablet, mobile.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="bg-black border border-white/15 rounded-lg px-3 py-2 text-white"
            onChange={(e) => applyTemplate(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Choose template…</option>
            {HERO_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-black border border-white/15 rounded-lg p-1">
            {['desktop', 'tablet', 'mobile'].map(x => (
              <button
                key={x}
                onClick={() => { setBp(x); setSelectedId(null); }}
                className={`px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest ${bp === x ? 'bg-white text-black' : 'text-white/80 hover:text-white'}`}
              >
                {x}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-black border border-white/15 rounded-lg p-1">
            <button onClick={() => setZoom(z => clamp(Number((z - 0.1).toFixed(2)), 0.5, 1.5))} className="px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest text-white/80 hover:text-white">-</button>
            <div className="px-2 text-white/80 text-sm">Zoom {Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => clamp(Number((z + 0.1).toFixed(2)), 0.5, 1.5))} className="px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest text-white/80 hover:text-white">+</button>
          </div>

          <div className="flex items-center gap-2 bg-black border border-white/15 rounded-lg p-1">
            <button onClick={() => setSnapEnabled(v => !v)} className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest ${snapEnabled ? 'bg-white text-black' : 'text-white/80 hover:text-white'}`}>Snap</button>
            <button onClick={() => setShowGrid(v => !v)} className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest ${showGrid ? 'bg-white text-black' : 'text-white/80 hover:text-white'}`}>Grid</button>
            <button onClick={() => setShowGuides(v => !v)} className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest ${showGuides ? 'bg-white text-black' : 'text-white/80 hover:text-white'}`}>Guides</button>
          </div>

          <button onClick={saveDraft} disabled={isSaving} className="px-4 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white font-bold uppercase tracking-widest text-sm hover:border-white/40">
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={publish} disabled={isPublishing} className="px-4 py-2 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-grey-200">
            {isPublishing ? 'Publishing…' : 'Publish Live'}
          </button>

          <a
            href={previewUrl}
            onClick={(e) => {
              e.preventDefault();
              openPreview();
            }}
            className="px-4 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white font-bold uppercase tracking-widest text-sm hover:border-white/40"
          >
            Open Preview
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Stage */}
        <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-white/80 text-sm">Canvas: {canvas.width}×{canvas.height}</div>
            <div className="flex items-center gap-2">
              <button onClick={addText} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40">Text</button>
              <button onClick={addButton} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40">Button</button>
              <button onClick={addImage} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40">Image</button>
              <button onClick={deleteSelected} disabled={!selectedId} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40 disabled:opacity-40">Delete</button>
              <button onClick={duplicateSelected} disabled={!selectedId} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40 disabled:opacity-40">Duplicate</button>
            </div>
          </div>

          <div className="p-4 overflow-auto">
            <div
              ref={stageRef}
              onPointerDown={onStagePointerDown}
              style={{
                width: canvas.width * zoom,
                height: canvas.height * zoom,
                position: 'relative',
                background: background?.color || '#000',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                userSelect: 'none',
                backgroundImage: background?.radial || undefined,
                opacity: 1,
              }}
            >
              {background?.radial && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: background.radial,
                    opacity: background.opacity ?? 1,
                  }}
                />
              )}

              {background?.gridEnabled && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `linear-gradient(${rgba(background?.gridColor || '#ffffff', background?.gridOpacity ?? 0.18)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(background?.gridColor || '#ffffff', background?.gridOpacity ?? 0.18)} 1px, transparent 1px)`,
                    backgroundSize: `${(background?.gridSize ?? 20) * zoom}px ${(background?.gridSize ?? 20) * zoom}px`,
                    opacity: 1,
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                  display: showGrid ? 'block' : 'none',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                  backgroundSize: `${grid}px ${grid}px`,
                  opacity: 0.55,
                }}
              />

              {showGuides && (
                <div
                  style={{
                    position: 'absolute',
                    left: (canvas.width * zoom) / 2,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'rgba(255,255,255,0.14)',
                    pointerEvents: 'none'
                  }}
                />
              )}
              {showGuides && (
                <div
                  style={{
                    position: 'absolute',
                    top: (canvas.height * zoom) / 2,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: 'rgba(255,255,255,0.14)',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {elements
                .slice()
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map(el => {
                  const isSelected = el.id === selectedId;
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => startDrag(el, e)}
                      style={{
                        position: 'absolute',
                        left: el.x * zoom,
                        top: el.y * zoom,
                        width: el.width * zoom,
                        height: el.height * zoom,
                        transform: `rotate(${el.rotation || 0}deg) scale(${el.scale || 1})`,
                        transformOrigin: 'top left',
                        zIndex: el.zIndex || 0,
                        outline: isSelected ? '2px solid rgba(255,255,255,0.85)' : '1px solid rgba(255,255,255,0.12)',
                        boxShadow: isSelected ? '0 0 0 2px rgba(0,0,0,0.6)' : 'none',
                        borderRadius: 8,
                        cursor: 'move',
                      }}
                    >
                      {renderElementPreview(el)}

                      {isSelected && (
                        <>
                          {['nw', 'ne', 'sw', 'se'].map(corner => (
                            <div
                              key={corner}
                              onPointerDown={(e) => startResize(el, corner, e)}
                              title={`Resize ${corner}`}
                              style={{
                                position: 'absolute',
                                width: 10,
                                height: 10,
                                background: '#fff',
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.6)',
                                cursor: `${corner}-resize`,
                                left: corner.includes('w') ? -5 : 'auto',
                                right: corner.includes('e') ? -5 : 'auto',
                                top: corner.includes('n') ? -5 : 'auto',
                                bottom: corner.includes('s') ? -5 : 'auto',
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-white font-bold uppercase tracking-widest text-sm">Inspector</div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-white/10">
              <div>
                <div className="text-xs text-white/60">Autosave</div>
                <div className="text-sm text-white/90">{autoSave ? 'On' : 'Off'} {isAutoSaving ? '(saving…)': ''}</div>
              </div>
              <button
                onClick={() => setAutoSave(v => !v)}
                className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest ${autoSave ? 'bg-white text-black' : 'bg-black text-white border border-white/10'}`}
              >
                Toggle
              </button>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900 border border-white/10">
              <div className="text-xs text-white/60 mb-2">Background (this breakpoint)</div>
              <label className="text-xs text-white/70">
                Color
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={background?.color || '#000000'}
                    onChange={(e) => updateBackground({ color: e.target.value })}
                    className="h-10 w-12 rounded-md border border-white/10 bg-black"
                    title="Pick background color"
                  />
                  <input
                    className="flex-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                    value={background?.color || '#000000'}
                    onChange={(e) => updateBackground({ color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </label>

              <div className="mt-3">
                <div className="text-xs text-white/70 mb-1">Gradient</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-white/70">
                    Type
                    <select
                      className="w-full mt-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                      value={background?.gradientType || (background?.radial ? 'radial' : 'none')}
                      onChange={(e) => updateBackground({ gradientType: e.target.value })}
                    >
                      <option value="none">None</option>
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                  </label>

                  {(background?.gradientType || background?.radial) && (background?.gradientType || 'radial') === 'linear' && (
                    <label className="text-xs text-white/70">
                      Angle
                      <input
                        className="w-full mt-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                        type="number"
                        value={background?.gradientAngle ?? 135}
                        onChange={(e) => updateBackground({ gradientAngle: Number(e.target.value) })}
                      />
                    </label>
                  )}

                  <label className="text-xs text-white/70">
                    From
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={background?.gradientFrom || '#404040'}
                        onChange={(e) => updateBackground({ gradientFrom: e.target.value })}
                        className="h-10 w-12 rounded-md border border-white/10 bg-black"
                        title="Pick gradient start"
                      />
                      <input
                        className="flex-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                        value={background?.gradientFrom || '#404040'}
                        onChange={(e) => updateBackground({ gradientFrom: e.target.value })}
                        placeholder="#404040"
                      />
                    </div>
                  </label>

                  <label className="text-xs text-white/70">
                    To
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={background?.gradientTo || '#000000'}
                        onChange={(e) => updateBackground({ gradientTo: e.target.value })}
                        className="h-10 w-12 rounded-md border border-white/10 bg-black"
                        title="Pick gradient end"
                      />
                      <input
                        className="flex-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                        value={background?.gradientTo || '#000000'}
                        onChange={(e) => updateBackground({ gradientTo: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-2 rounded-lg border border-white/10 bg-black p-2">
                  <div
                    className="h-10 rounded-md"
                    style={{
                      background: background?.gradientType && background.gradientType !== 'none'
                        ? buildGradientCss(background)
                        : (background?.radial || 'transparent')
                    }}
                    title="Gradient preview"
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/70">Grid Background</div>
                  <button
                    onClick={() => updateBackground({
                      gridEnabled: !(background?.gridEnabled),
                      gridSize: background?.gridSize ?? 20,
                      gridOpacity: background?.gridOpacity ?? 0.18,
                      gridColor: background?.gridColor || '#ffffff'
                    })}
                    className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest ${background?.gridEnabled ? 'bg-white text-black' : 'bg-black text-white border border-white/10'}`}
                  >
                    {background?.gridEnabled ? 'On' : 'Off'}
                  </button>
                </div>
                {background?.gridEnabled && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className="text-xs text-white/70">
                      Size
                      <input
                        className="w-full mt-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                        type="number"
                        min="4"
                        max="200"
                        value={background?.gridSize ?? 20}
                        onChange={(e) => updateBackground({ gridSize: Number(e.target.value) })}
                      />
                    </label>
                    <label className="text-xs text-white/70">
                      Opacity
                      <input
                        className="w-full mt-1"
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={background?.gridOpacity ?? 0.18}
                        onChange={(e) => updateBackground({ gridOpacity: Number(e.target.value) })}
                      />
                    </label>
                    <label className="text-xs text-white/70 col-span-2">
                      Color
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={background?.gridColor || '#ffffff'}
                          onChange={(e) => updateBackground({ gridColor: e.target.value })}
                          className="h-10 w-12 rounded-md border border-white/10 bg-black"
                        />
                        <input
                          className="flex-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white"
                          value={background?.gridColor || '#ffffff'}
                          onChange={(e) => updateBackground({ gridColor: e.target.value })}
                        />
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <label className="text-xs text-white/70 mt-3 block">
                Overlay Opacity
                <input
                  className="w-full mt-1"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={background?.opacity ?? 1}
                  onChange={(e) => updateBackground({ opacity: Number(e.target.value) })}
                />
              </label>

              <label className="text-xs text-white/70 mt-3 block">
                Advanced: raw CSS (optional)
                <textarea
                  className="w-full mt-1 bg-black border border-white/10 rounded-md px-2 py-2 text-white min-h-[70px]"
                  value={background?.radial || ''}
                  onChange={(e) => updateBackground({ radial: e.target.value })}
                  placeholder="radial-gradient(...) or linear-gradient(...)"
                />
              </label>
            </div>

            {!selected && (
              <div className="text-grey-400 text-sm">Select an element to edit its properties.</div>
            )}

            {selected && (
              <>
                <div className="text-white/90 text-sm">Type: <span className="text-white font-bold">{selected.type}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {['x', 'y', 'width', 'height', 'zIndex'].map(k => (
                    <label key={k} className="text-xs text-white/70">
                      {k}
                      <input
                        className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                        type="number"
                        value={selected[k] ?? 0}
                        onChange={(e) => updateSelected({ [k]: Number(e.target.value) })}
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-white/70">
                    Rotation (deg)
                    <input
                      className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                      type="number"
                      value={selected.rotation || 0}
                      onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-xs text-white/70">
                    Scale
                    <input
                      className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                      type="number"
                      step="0.05"
                      value={selected.scale || 1}
                      onChange={(e) => updateSelected({ scale: Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-xs text-white/70">
                    Opacity
                    <input
                      className="w-full mt-1"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selected.opacity ?? 1}
                      onChange={(e) => updateSelected({ opacity: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={layerDown} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40">Send Back</button>
                  <button onClick={layerUp} className="px-3 py-2 rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40">Bring Front</button>
                </div>

                {selected.type === 'text' && (
                  <>
                    <label className="text-xs text-white/70">
                      Text
                      <textarea
                        className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white min-h-[90px]"
                        value={selected.text || ''}
                        onChange={(e) => updateSelected({ text: e.target.value })}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-white/70">
                        Font Size
                        <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" type="number" value={selected.fontSize || 48} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} />
                      </label>
                      <label className="text-xs text-white/70">
                        Font Weight
                        <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" type="number" value={selected.fontWeight || 800} onChange={(e) => updateSelected({ fontWeight: Number(e.target.value) })} />
                      </label>
                      <label className="text-xs text-white/70">
                        Line Height
                        <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" type="number" step="0.05" value={selected.lineHeight || 1.1} onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })} />
                      </label>
                      <label className="text-xs text-white/70">
                        Color
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={selected.color || '#ffffff'}
                            onChange={(e) => updateSelected({ color: e.target.value })}
                            className="h-10 w-12 rounded-md border border-white/10 bg-black"
                            title="Pick text color"
                          />
                          <input
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                            type="text"
                            value={selected.color || '#ffffff'}
                            onChange={(e) => updateSelected({ color: e.target.value })}
                          />
                        </div>
                      </label>
                    </div>
                  </>
                )}

                {selected.type === 'image' && (
                  <>
                    <label className="text-xs text-white/70">
                      Source
                      <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" value={selected.src || ''} onChange={(e) => updateSelected({ src: e.target.value })} />
                    </label>
                    <label className="text-xs text-white/70">
                      Object Fit
                      <select className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" value={selected.objectFit || 'contain'} onChange={(e) => updateSelected({ objectFit: e.target.value })}>
                        <option value="contain">contain</option>
                        <option value="cover">cover</option>
                        <option value="fill">fill</option>
                      </select>
                    </label>
                  </>
                )}

                {selected.type === 'button' && (
                  <>
                    <label className="text-xs text-white/70">
                      Label
                      <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" value={selected.text || ''} onChange={(e) => updateSelected({ text: e.target.value })} />
                    </label>
                    <label className="text-xs text-white/70">
                      Link
                      <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" value={selected.link || ''} onChange={(e) => updateSelected({ link: e.target.value })} />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-white/70">
                        Background
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={selected.background || '#e5e5e5'}
                            onChange={(e) => updateSelected({ background: e.target.value })}
                            className="h-10 w-12 rounded-md border border-white/10 bg-black"
                            title="Pick button background"
                          />
                          <input
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                            value={selected.background || ''}
                            onChange={(e) => updateSelected({ background: e.target.value })}
                          />
                        </div>
                      </label>
                      <label className="text-xs text-white/70">
                        Text Color
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={selected.color || '#000000'}
                            onChange={(e) => updateSelected({ color: e.target.value })}
                            className="h-10 w-12 rounded-md border border-white/10 bg-black"
                            title="Pick button text color"
                          />
                          <input
                            className="flex-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white"
                            value={selected.color || ''}
                            onChange={(e) => updateSelected({ color: e.target.value })}
                          />
                        </div>
                      </label>
                    </div>
                    <label className="text-xs text-white/70">
                      Border
                      <input className="w-full mt-1 bg-neutral-900 border border-white/10 rounded-md px-2 py-2 text-white" value={selected.border || ''} onChange={(e) => updateSelected({ border: e.target.value })} />
                    </label>
                  </>
                )}
              </>
            )}

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-white/60">Live status</div>
              <div className="text-sm text-white/90">Active hero: <span className="font-bold">{settings?.heroVariant || 'default'}</span></div>
              <div className="text-sm text-white/90">Published at: <span className="font-bold">{settings?.heroDesign?.publishedAt ? new Date(settings.heroDesign.publishedAt).toLocaleString() : '—'}</span></div>
              <div className="text-xs text-white/60 mt-1">Publishing switches the site to “designed”.</div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-3 rounded-lg font-bold shadow-lg">
          {toast}
        </div>
      )}

      {showImagePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-black border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-white font-bold uppercase tracking-widest text-sm">Image Picker</div>
              <button
                onClick={() => setShowImagePicker(false)}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:border-white/40"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                  <div className="text-xs text-white/60 mb-2">Upload</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f);
                    }}
                    className="block w-full text-white/80 text-sm"
                    disabled={isUploading}
                  />
                  <div className="text-xs text-white/50 mt-2">Uses `src/app/api/upload/route.js`.</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                  <div className="text-xs text-white/60 mb-2">Paste URL</div>
                  <div className="flex gap-2">
                    <input
                      id="hero-image-url"
                      className="flex-1 bg-black border border-white/10 rounded-md px-3 py-2 text-white"
                      placeholder="/uploads/... or https://..."
                      defaultValue="/hero-tshirts-mobile.png"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('hero-image-url');
                        const url = input?.value;
                        addImageWithSrc(url);
                      }}
                      className="px-4 py-2 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-grey-200"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {isUploading && (
                <div className="text-white/80 text-sm">Uploading…</div>
              )}

              {uploadedUrls.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 mb-2">Recent</div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {uploadedUrls.map((url) => (
                      <button
                        key={url}
                        onClick={() => addImageWithSrc(url)}
                        className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-white/40"
                        title={url}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="uploaded" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
