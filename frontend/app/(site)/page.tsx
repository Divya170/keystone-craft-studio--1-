import Link from 'next/link';
import { load } from '@/lib/server';
import type { Category, ContentBlock, FaqResponse, Product, Settings, SiteImages, Workshop } from '@/lib/types';
import { cityOf } from '@/lib/studio';
import { btn, eyebrow, pad2 } from '@/lib/ui';
import { Hero } from '@/components/home/Hero';
import { GalleryDrift } from '@/components/home/GalleryDrift';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ContactBlock } from '@/components/ContactBlock';
import { Photo } from '@/components/Photo';
import { StatusPill } from '@/components/shop/ProductCard';
import { LoadError } from '@/components/States';

export const dynamic = 'force-dynamic';

const CAT_RADII = ['160px 160px 20px 20px', '20px', '20px 20px 160px 20px', '160px 20px 20px 20px'];

export default async function HomePage() {
  const [settings, slides, images, featured, categories, workshops, gallery, faq] = await Promise.all([
    load<Settings>('/settings'),
    load<ContentBlock[]>('/content?type=hero_slide'),
    load<SiteImages>('/content/site-images'),
    load<Product[]>('/products/featured'),
    load<Category[]>('/categories'),
    load<Workshop[]>('/workshops'),
    load<ContentBlock[]>('/content?type=gallery_image'),
    load<FaqResponse>('/content/faq?home=true'),
  ]);
  if (!settings) return <LoadError what="the studio site" />;

  const city = cityOf(settings);
  const feat = featured || [];
  const [main, ...rest] = feat;
  const ws = workshops || [];
  const [wsMain, ...wsRest] = ws;
  const cats = categories || [];
  const studioMain = images?.['home-studio-main'];
  const studioInset = images?.['home-studio-inset'];

  return (
    <>
      <Hero layout={settings.heroLayout} slides={slides || []} inset={images?.['home-hero-inset'] || null} city={city} />

      {/* Featured pieces — shown only once the studio features real products */}
      {main && (
        <section aria-labelledby="feat-title" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pb-[clamp(80px,10vw,140px)]">
          <div className="flex flex-wrap justify-between items-end gap-5 mb-[clamp(28px,4vw,48px)]">
            <div className="flex flex-col gap-3.5">
              <p className={eyebrow}>From the shelves</p>
              <h2 id="feat-title" className="font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.02em]">
                Featured pieces
              </h2>
            </div>
            <Link href="/shop" className={btn.link}>
              Browse the full shop <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[clamp(16px,2vw,28px)]">
            <Link href={`/shop/${main.slug}`} className="group col-span-2 lg:row-span-2 flex flex-col gap-4 no-underline text-ink hover:text-ink">
              <div className="relative flex-1 min-h-[clamp(340px,40vw,560px)] rounded-[180px_28px_28px_28px] overflow-hidden">
                <Photo
                  src={main.images[0]?.url}
                  alt={main.images[0]?.alt || main.name}
                  toneKey={main.id}
                  note="photo to come"
                  className="transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex justify-between items-end gap-4 flex-wrap">
                <div className="flex flex-col gap-1.5">
                  {main.category && <span className="font-semibold text-[12.5px] tracking-[0.14em] uppercase text-muted">{main.category.name}</span>}
                  <span className="font-display text-[clamp(26px,2.4vw,34px)] leading-[1.1]">{main.name}</span>
                </div>
                <span className="inline-flex items-center gap-2.5 min-h-11 font-semibold text-[15px] border-b-[1.5px] border-clay">
                  View Product <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
            {rest.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="group flex flex-col gap-3.5 no-underline text-ink hover:text-ink">
                <div className="relative aspect-[4/5] rounded-[22px] overflow-hidden">
                  <Photo src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} toneKey={p.id} className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {p.category && <span className="font-semibold text-xs tracking-[0.14em] uppercase text-muted">{p.category.name}</span>}
                  <span className="font-display text-xl leading-[1.2]">{p.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories rail */}
      {cats.length > 0 && (
        <section aria-labelledby="cat-title" className="bg-sand py-[clamp(72px,9vw,120px)] overflow-hidden">
          <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] grid gap-6 items-end mb-[clamp(32px,4vw,56px)] grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))]">
            <h2 id="cat-title" className="font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.02em] text-balance">
              Find your way <br />
              into the studio.
            </h2>
            <p className="text-lg leading-relaxed text-body max-w-[440px]">
              Start with a category and wander from there. Every piece links back to its category, so it&apos;s easy to keep exploring.
            </p>
          </div>
          <ul
            className="thin-scroll list-none m-0 flex gap-[clamp(16px,2vw,24px)] overflow-x-auto snap-x snap-mandatory pt-2 pb-4"
            style={{ paddingInline: 'max(clamp(20px,4vw,48px), calc((100vw - 1320px) / 2 + 48px))', scrollPaddingInline: 'clamp(20px,4vw,48px)' }}
          >
            {cats.map((c, i) => (
              <li key={c.id} className="flex-none w-[clamp(250px,24vw,320px)] snap-start">
                <Link href={`/shop?category=${c.slug}`} className="group flex flex-col gap-4 no-underline text-ink hover:text-ink transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: CAT_RADII[i % CAT_RADII.length] }}>
                    <Photo src={c.image} alt={c.imageAlt || c.name} toneKey={c.id} className="transition-transform duration-[1200ms] group-hover:scale-[1.07] group-hover:-translate-x-[2%]" />
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-[26px] leading-[1.1]">{c.name}</span>
                      {c.description && <span className="text-[15px] leading-[1.4] text-muted">{c.description}</span>}
                    </div>
                    <span aria-hidden className="flex-none w-11 h-11 rounded-full border-[1.5px] border-ink grid place-items-center font-medium text-lg">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Workshops */}
      {wsMain && (
        <section aria-labelledby="ws-title" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(80px,10vw,140px)]">
          <div className="flex flex-wrap justify-between items-end gap-5 mb-[clamp(32px,4vw,56px)]">
            <div className="flex flex-col gap-3.5 max-w-[720px]">
              <p className={eyebrow}>Workshops</p>
              <h2 id="ws-title" className="font-display text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.02em] text-balance">
                Learn it by hand.
              </h2>
            </div>
            <Link href="/workshops" className={btn.link}>
              Discover Workshops <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid items-stretch grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
            <div className="group relative min-h-[clamp(340px,42vw,580px)] rounded-[28px] overflow-hidden">
              <div className="absolute -inset-[4%] transition-transform duration-[6000ms] ease-out group-hover:scale-[1.06] group-hover:-translate-x-[1.5%] group-hover:-translate-y-[1%]">
                <Photo src={wsMain.image} alt={wsMain.imageAlt || wsMain.title} toneKey={wsMain.id} />
              </div>
            </div>
            <div className="bg-moss text-paper rounded-[28px] p-[clamp(28px,4vw,56px)] flex flex-col gap-[22px] mt-[-40px] mx-4 xl:my-12 xl:ml-[-64px] xl:mr-0 relative">
              <StatusPill status={wsMain.status} dark />
              <h3 className="font-display text-[clamp(30px,3vw,44px)] leading-[1.05] tracking-[-0.015em]">{wsMain.title}</h3>
              {wsMain.summary && <p className="text-[17px] leading-relaxed text-mist">{wsMain.summary}</p>}
              <div className="flex flex-wrap gap-3 mt-auto">
                {wsMain.canRegister && wsMain.status !== 'Date To Be Announced' ? (
                  <Link href={`/workshops?workshop=${wsMain.slug}#register`} className="inline-flex items-center gap-3 min-h-[52px] px-6 rounded-full bg-paper text-ink font-semibold no-underline transition-[background,gap] hover:bg-white hover:text-ink hover:gap-4">
                    Register <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <Link
                    href={`/contact?type=workshop&ref=${encodeURIComponent(wsMain.title)}#contact-form`}
                    className="inline-flex items-center gap-3 min-h-[52px] px-6 rounded-full bg-paper text-ink font-semibold no-underline transition-[background,gap] hover:bg-white hover:text-ink hover:gap-4"
                  >
                    Ask About Workshop <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
              {wsRest.length > 0 && (
                <ul className="list-none mt-2 p-0 flex flex-col">
                  {wsRest.map((w, i) => (
                    <li key={w.id} className="border-t-[1.5px] border-dashed border-paper/35">
                      <Link
                        href={`/workshops?workshop=${w.slug}#register`}
                        className="flex items-center gap-4 min-h-16 text-paper no-underline transition-[padding] duration-[250ms] hover:pl-2 hover:text-white"
                      >
                        <span className="font-mono font-medium text-[13px] text-[#D5CDBB]">{pad2(i + 2)}</span>
                        <span className="flex-1 font-display text-xl leading-[1.2]">{w.title}</span>
                        <span className="font-medium text-sm leading-[1.2] text-[#D5CDBB] hidden sm:inline">{w.status}</span>
                        <span aria-hidden>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <GalleryDrift images={gallery || []} />

      {/* The studio */}
      <section
        aria-labelledby="about-title"
        className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(80px,10vw,140px)] grid items-center gap-[clamp(48px,7vw,112px)] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]"
      >
        <div className="relative pb-12">
          <div className="relative w-[78%] aspect-[3/4] rounded-[28px_180px_28px_28px] overflow-hidden">
            <Photo src={studioMain?.image} alt={studioMain?.alt || 'The studio'} toneKey="studio-main" />
          </div>
          <div className="absolute right-0 bottom-0 w-[46%] aspect-square rounded-full border-8 border-paper overflow-hidden">
            <Photo src={studioInset?.image} alt={studioInset?.alt || 'At the bench'} toneKey="studio-inset" />
          </div>
        </div>
        <div className="flex flex-col gap-6 max-w-[560px]">
          <p className={eyebrow}>The studio</p>
          <h2 id="about-title" className="font-display text-[clamp(36px,4.2vw,60px)] leading-[1.04] tracking-[-0.02em] text-balance">
            A local studio for making things by hand.
          </h2>
          {settings.studioSummary && <p className="text-lg leading-[1.65] text-muted whitespace-pre-line">{settings.studioSummary}</p>}
          <p className="font-hand font-semibold text-[28px] leading-[1.2] text-moss">{city}</p>
          <div>
            <Link href="/about" className={`${btn.outline} min-h-[52px] px-[26px]`}>
              Learn About the Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Good to know */}
      {faq && faq.items.length > 0 && (
        <section aria-labelledby="faq-home-title" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pb-[clamp(80px,10vw,140px)]">
          <div className="border-t-2 border-dashed border-rule pt-[clamp(48px,6vw,80px)] grid gap-[clamp(32px,5vw,80px)] grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]">
            <div className="flex flex-col gap-4 max-w-[380px]">
              <h2 id="faq-home-title" className="font-display text-[clamp(30px,3.2vw,44px)] leading-[1.08] tracking-[-0.015em]">
                Good to know
              </h2>
              <p className="text-[17px] leading-relaxed text-muted">Quick answers about orders, workshops and visiting.</p>
              <Link href="/faq" className={`${btn.link} self-start`}>
                See all questions <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="min-w-0">
              <FaqAccordion items={faq.items} />
            </div>
          </div>
        </section>
      )}

      <ContactBlock settings={settings} images={images} heading="Say hello to the studio." />
    </>
  );
}
