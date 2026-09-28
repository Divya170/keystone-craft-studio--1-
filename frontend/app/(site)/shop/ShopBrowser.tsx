'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ShopResponse } from '@/lib/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { CardSkeletons } from '@/components/States';
import { btn } from '@/lib/ui';

interface Filters {
  q: string;
  category: string;
  sort: string;
  availability: string;
}

const plural = (n: number) => `${n} ${n === 1 ? 'product' : 'products'}`;

/** Search (debounced), category, availability and sort — all filtered by the API. */
export function ShopBrowser({ initial, init }: { initial: ShopResponse; init: Filters }) {
  const [q, setQ] = useState(init.q);
  const [f, setF] = useState<Filters>(init);
  const [data, setData] = useState<ShopResponse>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState(false);
  const first = useRef(true);
  const sheetClose = useRef<HTMLButtonElement | null>(null);

  // Debounce typing (comp: 280ms), then fetch.
  useEffect(() => {
    if (q === f.q) return;
    const t = setTimeout(() => setF((x) => ({ ...x, q })), 280);
    return () => clearTimeout(t);
  }, [q, f.q]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const qs = new URLSearchParams();
    if (f.q.trim()) qs.set('q', f.q.trim());
    if (f.category !== 'all') qs.set('category', f.category);
    if (f.sort !== 'featured') qs.set('sort', f.sort);
    if (f.availability) qs.set('availability', f.availability);
    let live = true;
    setLoading(true);
    setError(false);
    api
      .get<ShopResponse>(`/products?${qs}`)
      .then((r) => live && setData(r))
      .catch(() => live && setError(true))
      .finally(() => live && setLoading(false));
    window.history.replaceState(null, '', `/shop${qs.toString() ? `?${qs}` : ''}`);
    return () => {
      live = false;
    };
  }, [f]);

  useEffect(() => {
    if (!sheet) return;
    document.body.style.overflow = 'hidden';
    sheetClose.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [sheet]);

  const options = useMemo(() => [{ slug: 'all', name: 'All products', count: data.allCount }, ...data.categories], [data]);
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));
  const reset = () => {
    setQ('');
    setF({ q: '', category: 'all', sort: 'featured', availability: '' });
  };
  const activeFilters = (f.category !== 'all' ? 1 : 0) + (f.availability ? 1 : 0);
  const emptyCatalogue = data.catalogueSize === 0;
  const searching = loading || q !== f.q;

  const sidebar = (big: boolean) => (
    <>
      <div role="group" aria-label="Category" className={`flex flex-col ${big ? 'gap-1.5' : 'gap-1'}`}>
        {options.map((o) => {
          const on = f.category === o.slug;
          return big ? (
            <button
              key={o.slug}
              type="button"
              aria-pressed={on}
              onClick={() => set({ category: o.slug })}
              className="flex justify-between items-center min-h-14 px-[18px] rounded-[14px] border-[1.5px] cursor-pointer font-medium text-[17px]"
              style={{ borderColor: on ? '#2B211B' : '#CDBDA8', background: on ? '#2B211B' : 'transparent', color: on ? '#F3ECE1' : '#2B211B' }}
            >
              <span>{o.name}</span>
              <span>{on ? '✓ Selected' : o.count}</span>
            </button>
          ) : (
            <button
              key={o.slug}
              type="button"
              aria-pressed={on}
              onClick={() => set({ category: o.slug })}
              className="flex justify-between items-center gap-3 min-h-[46px] px-4 rounded-xl border-0 cursor-pointer text-left font-medium text-[15px] transition-colors hover:bg-linen"
              style={{ background: on ? '#2B211B' : undefined, color: on ? '#F3ECE1' : '#2B211B' }}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: on ? '#E3A27F' : '#CDBDA8' }} />
                {o.name}
              </span>
              <span className="font-mono font-medium text-[13px] opacity-85">{o.count}</span>
            </button>
          );
        })}
      </div>
      {data.availabilityOptions.length > 0 && (
        <>
          <p className="font-bold text-xs tracking-[0.16em] uppercase text-muted pt-2">Availability</p>
          <div role="group" aria-label="Availability" className="flex flex-wrap gap-2">
            {['', ...data.availabilityOptions].map((a) => {
              const on = f.availability === a;
              return (
                <button
                  key={a || 'any'}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ availability: a })}
                  className="min-h-11 px-4 rounded-full border-[1.5px] cursor-pointer font-medium text-sm"
                  style={{ borderColor: on ? '#2B211B' : '#CDBDA8', background: on ? '#2B211B' : 'transparent', color: on ? '#F3ECE1' : '#2B211B' }}
                >
                  {a || 'Any'}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <div className="sticky top-[76px] z-20 bg-paper/95 backdrop-blur-[8px] border-y border-rule">
        <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-3 flex flex-wrap items-center gap-3">
          <div role="search" className="flex-[1_1_280px] flex items-center gap-2.5 min-h-[52px] pl-[18px] pr-1.5 rounded-full bg-cream border-[1.5px] border-edge">
            <label htmlFor="shop-q" className="font-semibold text-sm text-muted">
              Search
            </label>
            <input
              id="shop-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Product or category"
              autoComplete="off"
              className="flex-1 min-w-0 h-12 border-0 bg-transparent text-base outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  set({ q: '' });
                  document.getElementById('shop-q')?.focus();
                }}
                aria-label="Clear search"
                className="w-11 h-11 rounded-full border-0 bg-linen cursor-pointer text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            className="lg:hidden min-h-[52px] px-5 rounded-full border-[1.5px] border-ink bg-transparent cursor-pointer font-semibold text-[15px]"
          >
            {activeFilters ? `Filters · ${activeFilters}` : 'Filters'}
          </button>
          <div className="flex items-center gap-2.5 min-h-[52px]">
            <label htmlFor="shop-sort" className="font-semibold text-sm text-muted">
              Sort
            </label>
            <select
              id="shop-sort"
              value={f.sort}
              onChange={(e) => set({ sort: e.target.value })}
              className="min-h-12 px-3.5 rounded-xl border-[1.5px] border-edge bg-cream font-medium text-[15px] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="az">Name, A–Z</option>
              <option value="za">Name, Z–A</option>
            </select>
          </div>
          <p aria-live="polite" className="ml-auto font-medium text-sm text-muted min-w-[110px] text-right">
            {searching ? 'Searching…' : plural(data.total)}
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(28px,4vw,48px)] pb-[clamp(80px,10vw,128px)] grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-[clamp(24px,4vw,56px)] items-start">
        <aside aria-label="Filters" className="hidden lg:flex sticky top-44 flex-col gap-5">
          <h2 className="font-bold text-[12.5px] leading-[1.2] tracking-[0.16em] uppercase text-muted">Category</h2>
          {sidebar(false)}
        </aside>

        <div className="min-w-0">
          {searching ? (
            <CardSkeletons />
          ) : error ? (
            <div role="alert" className="p-[clamp(32px,5vw,56px)] rounded-[28px] bg-sand flex flex-col items-start gap-4 max-w-[640px]">
              <h2 className="font-display text-[28px] leading-[1.1]">The shop didn’t load.</h2>
              <p className="text-[17px] leading-relaxed text-body">Please try again in a moment.</p>
              <button type="button" onClick={() => setF((x) => ({ ...x }))} className={btn.primary}>
                Try again
              </button>
            </div>
          ) : emptyCatalogue ? (
            <div className="p-[clamp(40px,6vw,80px)] rounded-[28px] bg-sand flex flex-col items-start gap-4 max-w-[640px]">
              <h2 className="font-display text-[32px] leading-[1.1]">New pieces are on the way.</h2>
              <p className="text-[17px] leading-relaxed text-body">
                The studio is photographing its first pieces for the shop. In the meantime, ask about anything you&apos;re looking for — or join a workshop and make your own.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact?type=product#contact-form" className={btn.primary}>
                  Contact Studio
                </Link>
                <Link href="/workshops" className={btn.outline}>
                  Explore Workshops
                </Link>
              </div>
            </div>
          ) : data.items.length === 0 ? (
            <div className="p-[clamp(40px,6vw,80px)] rounded-[28px] bg-sand flex flex-col items-start gap-4 max-w-[640px]">
              <h2 className="font-display text-[32px] leading-[1.1]">{f.q ? `Nothing matches “${f.q}”.` : 'Nothing here yet.'}</h2>
              <p className="text-[17px] leading-relaxed text-body">
                Try a different word, or browse every category. Looking for something specific? The studio is happy to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={reset} className={btn.primary}>
                  Clear search &amp; filters
                </button>
                <Link href="/contact#contact-form" className={btn.outline}>
                  Contact Studio
                </Link>
              </div>
            </div>
          ) : (
            <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[clamp(14px,2vw,28px)]">
              {data.items.map((p, i) => (
                <li key={p.id}>
                  <ProductCard p={p} eager={i < 4} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {sheet && (
        <>
          <div onClick={() => setSheet(false)} className="fixed inset-0 z-[60] bg-ink/45 lg:hidden" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="lg:hidden fixed inset-x-0 bottom-0 z-[61] bg-paper rounded-t-[28px] px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] max-h-[80vh] overflow-auto flex flex-col gap-4 animate-rise"
          >
            <span aria-hidden className="self-center w-11 h-[5px] rounded-full bg-edge" />
            <div className="flex justify-between items-center">
              <h2 id="sheet-title" className="font-display text-[26px] leading-none">
                Filter
              </h2>
              <button ref={sheetClose} type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="w-11 h-11 rounded-full border-[1.5px] border-ink bg-transparent cursor-pointer text-xl">
                ×
              </button>
            </div>
            <p className="font-bold text-xs tracking-[0.16em] uppercase text-muted">Category</p>
            {sidebar(true)}
            <button type="button" onClick={() => setSheet(false)} className="min-h-14 rounded-full border-0 bg-clay text-cream cursor-pointer font-semibold text-[17px]">
              {searching ? 'Updating…' : `Show ${plural(data.total)}`}
            </button>
          </div>
        </>
      )}
    </>
  );
}
