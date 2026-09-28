import { load } from '@/lib/server';
import type { ShopResponse } from '@/lib/types';
import { eyebrow } from '@/lib/ui';
import { LoadError } from '@/components/States';
import { ShopBrowser } from './ShopBrowser';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shop' };

type SP = { q?: string; category?: string; sort?: string; availability?: string };

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const init = { q: searchParams.q || '', category: searchParams.category || 'all', sort: searchParams.sort || 'featured', availability: searchParams.availability || '' };
  const qs = new URLSearchParams();
  if (init.q) qs.set('q', init.q);
  if (init.category !== 'all') qs.set('category', init.category);
  if (init.sort !== 'featured') qs.set('sort', init.sort);
  if (init.availability) qs.set('availability', init.availability);
  const data = await load<ShopResponse>(`/products?${qs}`);
  if (!data) return <LoadError what="the shop" />;

  return (
    <>
      <section
        aria-labelledby="shop-title"
        className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(32px,5vw,72px)] pb-[clamp(24px,3vw,40px)] grid gap-6 items-end grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]"
      >
        <div className="flex flex-col gap-3.5">
          <p className={eyebrow}>Shop</p>
          <h1 id="shop-title" className="font-display text-[clamp(44px,6vw,88px)] leading-[.98] tracking-[-0.025em]">
            The shop
          </h1>
        </div>
        <p className="text-lg leading-relaxed text-body max-w-[30em]">
          Browse handmade pieces from Keystone Craft Studio. See something you like? Ask the studio about it.
        </p>
      </section>
      <ShopBrowser initial={data} init={init} />
    </>
  );
}
