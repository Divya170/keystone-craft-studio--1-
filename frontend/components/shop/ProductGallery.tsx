'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductImage } from '@/lib/types';
import { mediaUrl } from '@/lib/api';
import { toneFor } from '@/lib/ui';

/**
 * Main image + thumbs + full-screen viewer (arrow keys, Escape, swipe),
 * returning focus to the main image when the viewer closes.
 */
export function ProductGallery({ images, name, toneKey }: { images: ProductImage[]; name: string; toneKey: string }) {
  const list = images.length ? images : [{ url: '', alt: `${name} — photo to come`, label: 'Photo to come' }];
  const n = list.length;
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const mainRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const tx = useRef(0);
  const step = (d: number) => setIdx((i) => (i + d + n) % n);
  const cur = list[idx];
  const label = (im: ProductImage, i: number) => im.label || (i === 0 ? 'Primary' : `View ${i + 1}`);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      mainRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      tx.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const d = e.changedTouches[0].clientX - tx.current;
      if (Math.abs(d) > 40) step(d < 0 ? 1 : -1);
    },
  };
  const bg = (im: ProductImage) => {
    const u = mediaUrl(im.url);
    return u ? { background: `url(${u}) center/cover no-repeat` } : undefined;
  };
  const counter = `${idx + 1} / ${n}`;

  return (
    <div className="flex flex-col gap-3.5 min-w-0">
      <button
        ref={mainRef}
        type="button"
        onClick={() => images.length && setOpen(true)}
        {...swipe}
        aria-label={images.length ? `Enlarge image ${idx + 1} of ${n}: ${label(cur, idx)} view of ${name}` : cur.alt}
        className={`relative block w-full aspect-[4/5] border-0 p-0 rounded-[28px] overflow-hidden ${images.length ? 'cursor-zoom-in' : 'cursor-default'} ${cur.url ? '' : toneFor(toneKey)}`}
        style={bg(cur)}
      >
        {images.length > 0 && (
          <span className="absolute right-4 top-4 px-3 py-2 rounded-full bg-cream/90 font-semibold text-[13px] leading-none text-ink">{counter} · Enlarge</span>
        )}
        {!images.length && <span className="absolute left-5 bottom-5 font-mono text-xs text-[#3F3229] bg-cream/80 px-3 py-2 rounded-lg">PHOTO · to come</span>}
      </button>
      {n > 1 && (
        <div role="group" aria-label="Product images" className="grid grid-cols-4 gap-3">
          {list.map((im, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show image ${i + 1}: ${label(im, i)}`}
              aria-current={i === idx ? 'true' : undefined}
              className="aspect-square rounded-2xl border-2 p-0 cursor-pointer transition-opacity hover:opacity-100"
              style={{ ...bg(im), borderColor: i === idx ? '#2B211B' : 'transparent', opacity: i === idx ? 1 : 0.7 }}
            />
          ))}
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[80] bg-[rgba(30,23,19,.94)] flex flex-col p-4">
          <div className="flex justify-between items-center text-paper font-medium text-[15px]">
            <span aria-live="polite">
              {counter} · {label(cur, idx)}
            </span>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close image viewer" className="w-12 h-12 rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer text-[22px]">
              ×
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 min-h-0 py-4">
            {n > 1 && (
              <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="flex-none w-[52px] h-[52px] rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer text-lg">
                ←
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...swipe} src={mediaUrl(cur.url) || ''} alt={cur.alt || name} className="max-h-[82vh] max-w-[calc(100%-128px)] object-contain rounded-[20px]" />
            {n > 1 && (
              <button type="button" onClick={() => step(1)} aria-label="Next image" className="flex-none w-[52px] h-[52px] rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer text-lg">
                →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
