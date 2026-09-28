'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ContentBlock } from '@/lib/types';
import { mediaUrl } from '@/lib/api';
import { btn, eyebrow, toneFor } from '@/lib/ui';

/** Crossfading hero photos (6.5s; paused with reduced motion / hidden tab). */
function useRotation(count: number) {
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => {
      if (!reduced && !document.hidden) setIdx((i) => (i + 1) % count);
    }, 6500);
    return () => clearInterval(t);
  }, [count, reduced]);
  return { idx, setIdx, reduced };
}

function Slides({ slides, idx, reduced }: { slides: ContentBlock[]; idx: number; reduced: boolean }) {
  if (!slides.length) return <div role="img" aria-label="Studio photo to come" className="absolute inset-0 tone-clay" />;
  return (
    <>
      {slides.map((s, i) => {
        const url = mediaUrl(s.fields.image);
        const on = i === idx;
        return (
          <div
            key={s.id}
            role="img"
            aria-label={s.fields.alt || 'Studio photo'}
            aria-hidden={on ? undefined : true}
            className={`absolute inset-0 ${url ? '' : toneFor(i)}`}
            style={{
              backgroundImage: url ? `url(${url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: on ? 1 : 0,
              transform: on && !reduced ? 'scale(1.06)' : 'scale(1)',
              transition: 'opacity 1.6s ease, transform 7s linear',
            }}
          />
        );
      })}
    </>
  );
}

function Dots({ count, idx, onPick }: { count: number; idx: number; onPick: (i: number) => void }) {
  if (count < 2) return null;
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Show hero image ${i + 1} of ${count}`}
          aria-pressed={i === idx}
          className="w-11 h-11 border-0 bg-transparent cursor-pointer grid place-items-center"
        >
          <span className="block h-2 rounded-full transition-[width,background] duration-300" style={{ width: i === idx ? 28 : 8, background: i === idx ? '#A64A28' : '#CDBDA8' }} />
        </button>
      ))}
    </div>
  );
}

const TITLE = (
  <>
    Crafted with <span className="text-clay">intention.</span> Made to inspire.
  </>
);
const INTRO =
  'Keystone Craft Studio is a home for handmade goods and hands-on workshops. Browse pieces from the studio, or pull up a seat and make something of your own.';

export function Hero({
  layout,
  slides,
  inset,
  city,
}: {
  layout: 'split' | 'layered';
  slides: ContentBlock[];
  inset: { image: string | null; alt: string } | null;
  city: string;
}) {
  const { idx, setIdx, reduced } = useRotation(slides.length);
  const cityShort = city.replace(', Pennsylvania', ', PA');

  if (layout === 'layered') {
    return (
      <section aria-labelledby="hero-title" className="max-w-wide mx-auto px-[clamp(12px,2vw,24px)] pt-[clamp(12px,2vw,24px)] pb-[clamp(72px,9vw,128px)]">
        <div className="relative rounded-[32px] overflow-hidden h-[clamp(420px,72vh,760px)] bg-[#D8BEA4]">
          <Slides slides={slides} idx={idx} reduced={reduced} />
          <div className="absolute right-4 bottom-2">
            <Dots count={slides.length} idx={idx} onPick={setIdx} />
          </div>
        </div>
        <div className="relative mt-[clamp(-220px,-16vw,-120px)] mr-auto ml-[clamp(0px,4vw,56px)] max-w-[720px] bg-paper rounded-[28px_28px_28px_4px] p-[clamp(28px,4vw,52px)] flex flex-col gap-[22px]">
          <p className={eyebrow}>Handmade goods + creative workshops · {cityShort}</p>
          <h1 id="hero-title" className="font-display text-[clamp(44px,6vw,88px)] leading-[.98] tracking-[-0.028em] text-balance">
            {TITLE}
          </h1>
          <p className="text-lg leading-relaxed text-body max-w-[32em]">{INTRO}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={btn.primary}>
              Explore the Shop <span aria-hidden>→</span>
            </Link>
            <Link href="/workshops" className={btn.outline}>
              Explore Workshops
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const insetUrl = mediaUrl(inset?.image);
  return (
    <section
      aria-labelledby="hero-title"
      className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(24px,5vw,64px)] pb-[clamp(72px,9vw,128px)] grid items-center gap-[clamp(48px,6vw,96px)] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))]"
    >
      <div className="flex flex-col gap-7 max-w-[640px]">
        <p className={eyebrow}>Handmade goods + creative workshops</p>
        <h1 id="hero-title" className="font-display text-[clamp(50px,7.2vw,108px)] leading-[.98] tracking-[-0.028em] text-balance">
          {TITLE}
        </h1>
        <p className="text-[clamp(18px,1.45vw,20px)] leading-relaxed text-body max-w-[31em] text-pretty">{INTRO}</p>
        <div className="flex flex-wrap gap-3 mt-1">
          <Link href="/shop" className={`${btn.primary} hover:-translate-y-px`}>
            Explore the Shop <span aria-hidden>→</span>
          </Link>
          <Link href="/workshops" className={btn.outline}>
            Explore Workshops
          </Link>
        </div>
        <p className="mt-2 flex items-center gap-3 font-medium text-[15px] text-muted">
          <span aria-hidden className="w-7 h-0 border-t-2 border-dashed border-sage" />
          {city}
        </p>
      </div>
      <div className="relative pb-14">
        <div className="relative w-[84%] ml-auto aspect-[4/5] rounded-[999px_999px_28px_28px] overflow-hidden bg-[#D8BEA4]">
          <Slides slides={slides} idx={idx} reduced={reduced} />
        </div>
        {insetUrl && (
          <div
            role="img"
            aria-label={inset?.alt || ''}
            className="absolute left-0 bottom-0 w-[42%] aspect-square rounded-[26px] border-8 border-paper -rotate-[4deg]"
            style={{ background: `url(${insetUrl}) center/cover no-repeat` }}
          />
        )}
        <span aria-hidden className="absolute top-[9%] left-[4%] font-hand font-semibold text-[30px] leading-none text-clay -rotate-[8deg]">
          made by hand
        </span>
        <div className="absolute right-0 bottom-1.5">
          <Dots count={slides.length} idx={idx} onPick={setIdx} />
        </div>
      </div>
    </section>
  );
}
