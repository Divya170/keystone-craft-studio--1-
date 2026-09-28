import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { load } from '@/lib/server';
import type { ProductDetail, Settings } from '@/lib/types';
import { cityOf, nameOf, paragraphs } from '@/lib/studio';
import { money } from '@/lib/ui';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductCard } from '@/components/shop/ProductCard';
import { LoadError } from '@/components/States';

export const dynamic = 'force-dynamic';

async function getProduct(slug: string): Promise<ProductDetail | 'missing' | null> {
  try {
    return await api.get<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
  } catch (e) {
    return e instanceof ApiError && e.status === 404 ? 'missing' : null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const d = await getProduct(params.slug);
  return { title: d && d !== 'missing' ? d.product.name : 'Product' };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [d, settings] = await Promise.all([getProduct(params.slug), load<Settings>('/settings')]);
  if (d === 'missing') notFound();
  if (!d) return <LoadError what="this product" />;
  const { product: p, related } = d;
  const ask = `/contact?type=product&ref=${encodeURIComponent(p.name)}#contact-form`;
  const cat = p.category;
  const facts = [
    p.price != null ? ['Price', money(p.price)] : null,
    p.availability ? ['Availability', p.availability] : null,
    p.materials ? ['Materials', p.materials] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <>
      <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(20px,3vw,36px)] pb-[clamp(80px,10vw,128px)]">
        <nav aria-label="Breadcrumb" className="mb-[clamp(20px,3vw,36px)]">
          <ol className="list-none m-0 p-0 flex flex-wrap gap-2.5 font-medium text-sm text-muted">
            <li>
              <Link href="/shop" className="text-muted">
                Shop
              </Link>
            </li>
            {cat && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/shop?category=${cat.slug}`} className="text-muted">
                    {cat.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {p.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-[clamp(32px,5vw,80px)] items-start">
          <ProductGallery images={p.images} name={p.name} toneKey={p.id} />
          <div className="lg:sticky lg:top-[108px] flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {cat && <span className="font-semibold text-[12.5px] tracking-[0.16em] uppercase text-clay">{cat.name}</span>}
              <h1 className="font-display text-[clamp(38px,4.4vw,64px)] leading-[1.02] tracking-[-0.02em]">{p.name}</h1>
            </div>
            {paragraphs(p.description).map((para, i) => (
              <p key={i} className="text-lg leading-[1.65] text-body">
                {para}
              </p>
            ))}
            {facts.length > 0 && (
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 py-4 border-y-[1.5px] border-dashed border-rule text-base">
                {facts.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold">{k}</dt>
                    <dd className="m-0 text-body whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link
              href={ask}
              className="flex justify-center items-center gap-3 min-h-14 px-7 rounded-full bg-clay text-cream font-semibold no-underline transition-[background,gap] hover:bg-clay-hover hover:text-cream hover:gap-4"
            >
              Ask About This Product <span aria-hidden>→</span>
            </Link>
            <p className="text-[15px] leading-[1.55] text-muted">
              Items aren&apos;t sold online yet. Send a note and the studio will reply about this piece — the product name is added to your message for you.
            </p>
            <div className="border-t-[1.5px] border-dashed border-rule pt-5 flex flex-col gap-1.5">
              <span className="font-semibold text-[15px] leading-[1.3]">Visiting the studio?</span>
              <span className="text-[15px] leading-[1.55] text-muted">
                {nameOf(settings)}, {settings?.address ? `${settings.address}, ` : ''}
                {cityOf(settings)}. <Link href="/faq?category=Pickup">Pickup &amp; delivery questions</Link>
              </span>
            </div>
          </div>
        </div>

        {related.length > 0 && cat && (
          <section aria-labelledby="rel-title" className="mt-[clamp(72px,9vw,120px)]">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-7">
              <h2 id="rel-title" className="font-display text-[clamp(30px,3.2vw,44px)] leading-[1.05]">
                More from {cat.name}
              </h2>
              <Link href={`/shop?category=${cat.slug}`} className="inline-flex items-center gap-2.5 min-h-11 font-semibold text-ink no-underline border-b-[1.5px] border-clay hover:text-clay">
                View category <span aria-hidden>→</span>
              </Link>
            </div>
            <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[clamp(14px,2vw,28px)]">
              {related.map((r) => (
                <li key={r.id}>
                  <ProductCard p={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Mobile sticky ask bar (< 700px) */}
      <div aria-hidden className="h-[84px] sm:hidden" />
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] bg-paper/95 border-t border-rule">
        <Link href={ask} className="flex justify-center items-center min-h-[54px] rounded-full bg-clay text-cream font-semibold no-underline hover:text-cream">
          Ask About This Product
        </Link>
      </div>
    </>
  );
}
