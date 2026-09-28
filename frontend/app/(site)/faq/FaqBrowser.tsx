'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { FaqResponse } from '@/lib/types';
import { btn, eyebrow } from '@/lib/ui';
import { FaqAccordion } from '@/components/FaqAccordion';

/** Search + topic chips (filtered by the API), grouped by topic like the comp. */
export function FaqBrowser({ all, initialCategory }: { all: FaqResponse; initialCategory: string }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initialCategory);
  const [data, setData] = useState<FaqResponse>(all);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current && initialCategory === 'All') {
      first.current = false;
      return;
    }
    first.current = false;
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (cat !== 'All') qs.set('category', cat);
    let live = true;
    const t = setTimeout(() => {
      setLoading(true);
      setError(false);
      api
        .get<FaqResponse>(`/content/faq?${qs}`)
        .then((r) => live && setData(r))
        .catch(() => live && setError(true))
        .finally(() => live && setLoading(false));
      window.history.replaceState(null, '', `/faq${cat !== 'All' ? `?category=${encodeURIComponent(cat)}` : ''}`);
    }, 200);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, cat, initialCategory]);

  const groups = all.categories.map((c) => ({ name: c, items: data.items.filter((f) => f.category === c) })).filter((g) => g.items.length);

  return (
    <section aria-labelledby="fq-title" className="max-w-[1100px] mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(40px,6vw,96px)] pb-[clamp(80px,10vw,128px)]">
      <p className={`${eyebrow} mb-[18px]`}>FAQ</p>
      <h1 id="fq-title" className="font-display text-[clamp(44px,6vw,88px)] leading-[.98] tracking-[-0.025em] mb-[clamp(28px,4vw,48px)]">
        Questions, answered.
      </h1>
      <div role="search" className="flex items-center gap-2.5 min-h-14 pl-5 pr-1.5 rounded-full bg-cream border-[1.5px] border-edge max-w-[560px]">
        <label htmlFor="faq-q" className="font-semibold text-sm text-muted">
          Search
        </label>
        <input
          id="faq-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. workshops, pickup"
          className="flex-1 min-w-0 h-[50px] border-0 bg-transparent text-base outline-none"
        />
      </div>
      <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2 mt-5 mb-[clamp(32px,4vw,56px)]">
        {['All', ...all.categories].map((c) => {
          const on = cat === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setCat(c)}
              className="min-h-11 px-[18px] rounded-full border-[1.5px] cursor-pointer font-medium text-[15px] transition-colors"
              style={{ borderColor: on ? '#2B211B' : '#CDBDA8', background: on ? '#2B211B' : 'transparent', color: on ? '#F3ECE1' : '#2B211B' }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {loading ? 'Searching' : `${data.items.length} questions`}
      </p>
      {error ? (
        <p role="alert" className="mb-10 text-lg text-err">
          The questions couldn’t load just now. Please try again in a moment.
        </p>
      ) : groups.length ? (
        <div className={loading ? 'opacity-60 transition-opacity' : ''}>
          {groups.map((g) => (
            <div key={g.name} className="mb-[clamp(36px,5vw,56px)]">
              <h2 className="font-display text-[28px] leading-[1.1] mb-2">{g.name}</h2>
              <FaqAccordion items={g.items} />
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="mb-10 text-lg leading-relaxed text-body">
            {q ? `No questions match “${q}”.` : 'No questions in this topic yet.'} Try another word, or ask the studio directly.
          </p>
        )
      )}

      <div className="mt-[clamp(24px,4vw,48px)] p-[clamp(28px,4vw,48px)] rounded-[28px] bg-sand flex flex-wrap justify-between items-center gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[28px] leading-[1.1]">Still wondering?</h2>
          <p className="text-base leading-normal text-body">Send a note — no question is too small.</p>
        </div>
        <Link href="/contact#contact-form" className={btn.primary}>
          Contact the Studio <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
