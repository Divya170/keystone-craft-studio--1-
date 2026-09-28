'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContentBlock } from '@/lib/types';
import { mediaUrl } from '@/lib/api';
import { toneFor } from '@/lib/ui';

// The comp's varied tile shapes, cycled across however many images exist.
const SHAPES: [number, number, string][] = [
  [360, 440, '24px'],
  [300, 300, '50%'],
  [300, 420, '180px 180px 24px 24px'],
  [280, 380, '24px'],
  [440, 360, '24px'],
  [320, 280, '24px 24px 120px 24px'],
  [380, 460, '24px'],
  [300, 400, '24px'],
];

/**
 * "Inside the studio": drifts slowly in a seamless loop; pauses on hover,
 * focus, touch, the Pause button, and whenever reduced motion is on.
 */
export function GalleryDrift({ images }: { images: ContentBlock[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hover = useRef(false);
  const gx = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused || reduced;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el && !pausedRef.current && !hover.current) {
        if (Math.abs(el.scrollLeft - Math.round(gx.current)) > 2) gx.current = el.scrollLeft; // user scrolled
        gx.current += 0.35;
        const half = el.scrollWidth / 2;
        if (gx.current >= half) gx.current -= half;
        el.scrollLeft = gx.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!images.length) return null;
  const loop = [...images.map((g) => ({ g, dup: false })), ...images.map((g) => ({ g, dup: true }))];
  const by = (d: number) => ref.current?.scrollBy({ left: d, behavior: reduced ? 'auto' : 'smooth' });
  const still = paused || reduced;

  return (
    <section aria-labelledby="gal-title" className="bg-ink text-paper py-[clamp(72px,9vw,120px)]">
      <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] flex flex-wrap justify-between items-end gap-6 mb-[clamp(32px,4vw,48px)]">
        <div className="flex flex-col gap-3.5">
          <p className="font-bold text-[12.5px] leading-[1.2] tracking-[0.18em] uppercase text-peach">Gallery</p>
          <h2 id="gal-title" className="font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.02em]">
            Inside the studio
          </h2>
        </div>
        <div role="group" aria-label="Gallery controls" className="flex gap-2.5">
          <button type="button" onClick={() => by(-380)} aria-label="Previous images" className="w-[52px] h-[52px] rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer text-lg transition-colors hover:bg-paper hover:text-ink">
            ←
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={still ? 'Play gallery motion' : 'Pause gallery motion'}
            aria-pressed={paused}
            disabled={reduced}
            className="min-w-24 h-[52px] px-[18px] rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer font-semibold text-sm transition-colors hover:bg-paper hover:text-ink disabled:opacity-50 disabled:cursor-default"
          >
            {still ? 'Play' : 'Pause'}
          </button>
          <button type="button" onClick={() => by(380)} aria-label="Next images" className="w-[52px] h-[52px] rounded-full border-[1.5px] border-paper bg-transparent text-paper cursor-pointer text-lg transition-colors hover:bg-paper hover:text-ink">
            →
          </button>
        </div>
      </div>
      <div
        ref={ref}
        tabIndex={0}
        aria-label="Studio gallery, scrollable"
        onMouseEnter={() => (hover.current = true)}
        onMouseLeave={() => (hover.current = false)}
        onFocus={() => (hover.current = true)}
        onBlur={() => (hover.current = false)}
        onTouchStart={() => (hover.current = true)}
        onTouchEnd={() => setTimeout(() => (hover.current = false), 2500)}
        className="no-scrollbar flex items-end gap-[18px] overflow-x-auto px-[clamp(20px,4vw,48px)] -outline-offset-4"
      >
        {loop.map(({ g, dup }, i) => {
          const [w, h, r] = SHAPES[(i % images.length) % SHAPES.length];
          const url = mediaUrl(g.fields.image);
          return (
            <figure key={`${g.id}-${dup ? 'b' : 'a'}`} aria-hidden={dup || undefined} className="flex-none flex flex-col gap-3" style={{ width: `min(${w}px, 78vw)` }}>
              <div
                role="img"
                aria-label={g.fields.alt || g.fields.caption || 'Studio photo'}
                className={url ? '' : toneFor(i)}
                style={{ height: `min(${h}px, ${Math.round((h / w) * 78)}vw)`, borderRadius: r, background: url ? `url(${url}) center/cover no-repeat` : undefined }}
              />
              {g.fields.caption && <figcaption className="font-medium text-sm leading-[1.4] text-oat">{g.fields.caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
