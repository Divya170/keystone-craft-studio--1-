import Link from 'next/link';
import type { Product } from '@/lib/types';
import { money } from '@/lib/ui';
import { Photo } from '../Photo';

export function ProductCard({ p, eager = false }: { p: Product; eager?: boolean }) {
  const img = p.images[0];
  return (
    <Link href={`/shop/${p.slug}`} className="group flex flex-col gap-3 no-underline text-ink hover:text-ink">
      <div className="relative aspect-[4/5] rounded-[20px] overflow-hidden">
        <Photo
          src={img?.url}
          alt={img?.alt || p.name}
          note="photo to come"
          toneKey={p.id}
          eager={eager}
          className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
        />
        {p.availability && p.availability !== 'Available' && (
          <span className="absolute left-3 top-3 px-3 py-1.5 rounded-full bg-cream/90 font-semibold text-xs">{p.availability}</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {p.category && <span className="font-semibold text-xs tracking-[0.14em] uppercase text-muted">{p.category.name}</span>}
        <span className="font-display text-[19px] leading-[1.2]">{p.name}</span>
        {p.price != null && <span className="font-medium text-[15px] text-body">{money(p.price)}</span>}
        <span className="inline-flex items-center gap-2 mt-1 font-semibold text-sm text-clay">
          View Product <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

export function StatusPill({ status, dark = false }: { status: string; dark?: boolean }) {
  return (
    <span className={`self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-semibold text-[13px] leading-none ${dark ? 'bg-paper text-ink' : 'bg-linen text-ink'}`}>
      <span aria-hidden className="w-2 h-2 rounded-full border-[1.5px] border-ink" />
      {status}
    </span>
  );
}
