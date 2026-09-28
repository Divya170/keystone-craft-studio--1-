import Link from 'next/link';
import { load } from '@/lib/server';
import type { ContentBlock, Settings, SiteImages } from '@/lib/types';
import { cityOf, nameOf, paragraphs } from '@/lib/studio';
import { btn, eyebrow } from '@/lib/ui';
import { Photo } from '@/components/Photo';
import { LoadError } from '@/components/States';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About' };

const PIC_STYLES = [
  { ratio: 'aspect-[3/4]', radius: '24px', mt: '' },
  { ratio: 'aspect-square', radius: '50%', mt: 'lg:mt-[clamp(0px,6vw,96px)]' },
  { ratio: 'aspect-[4/5]', radius: '24px 24px 160px 24px', mt: 'lg:mt-[clamp(0px,3vw,40px)]' },
];

export default async function AboutPage() {
  const [settings, images, pics, team] = await Promise.all([
    load<Settings>('/settings'),
    load<SiteImages>('/content/site-images'),
    load<ContentBlock[]>('/content?type=about_image'),
    load<ContentBlock[]>('/content?type=team_member'),
  ]);
  if (!settings) return <LoadError what="the About page" />;
  const city = cityOf(settings);
  const cityShort = city.split(',')[0];
  const story = paragraphs(settings.story);
  const phil = paragraphs(settings.philosophyText);
  const storyImg = images?.['about-story'];
  const locImg = images?.['about-location'];

  return (
    <>
      <section aria-labelledby="ab-title" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(40px,6vw,96px)] pb-[clamp(56px,7vw,96px)]">
        <p className={`${eyebrow} mb-5`}>About the studio</p>
        <h1 id="ab-title" className="max-w-[16ch] font-display text-[clamp(44px,6.4vw,100px)] leading-[.98] tracking-[-0.028em] text-balance">
          A {cityShort} studio for making things <span className="text-clay">by hand.</span>
        </h1>
      </section>

      <section
        aria-labelledby="ab-story"
        className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pb-[clamp(80px,10vw,140px)] grid items-center gap-[clamp(40px,6vw,96px)] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]"
      >
        <div className="relative aspect-[4/5] rounded-[28px_200px_28px_28px] overflow-hidden">
          <Photo src={storyImg?.image} alt={storyImg?.alt || 'The studio'} toneKey="about-story" />
        </div>
        <div className="flex flex-col gap-[22px] max-w-[540px]">
          <h2 id="ab-story" className="font-display text-[clamp(32px,3.6vw,50px)] leading-[1.05] tracking-[-0.02em]">
            How it started
          </h2>
          {story.length ? (
            story.map((p, i) => (
              <p key={i} className="text-lg leading-[1.7] text-body">
                {p}
              </p>
            ))
          ) : (
            <p className="text-lg leading-[1.7] text-body">
              {nameOf(settings)} is a home for handmade goods and hands-on workshops in {city}. The studio&apos;s full story is on its way — in the meantime,{' '}
              <Link href="/contact">say hello</Link>.
            </p>
          )}
        </div>
      </section>

      {settings.philosophyQuote && (
        <section aria-labelledby="ab-phil" className="bg-moss text-paper py-[clamp(80px,10vw,140px)] px-[clamp(20px,4vw,48px)]">
          <div className="max-w-[1100px] mx-auto flex flex-col gap-7">
            <h2 id="ab-phil" className="font-bold text-[12.5px] leading-[1.2] tracking-[0.18em] uppercase text-gold">
              Craft philosophy
            </h2>
            <blockquote className="font-display text-[clamp(30px,4vw,58px)] leading-[1.15] tracking-[-0.015em] text-balance">“{settings.philosophyQuote}”</blockquote>
            {phil.map((p, i) => (
              <p key={i} className="max-w-[40em] text-lg leading-[1.65] text-mist">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {pics && pics.length > 0 && (
        <section
          aria-label="Studio in pictures"
          className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(80px,10vw,140px)] grid items-start gap-[clamp(16px,2vw,28px)] grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"
        >
          {pics.map((g, i) => {
            const st = PIC_STYLES[i % PIC_STYLES.length];
            return (
              <figure key={g.id} className={`flex flex-col gap-3 ${st.mt}`}>
                <div className={`relative ${st.ratio} overflow-hidden`} style={{ borderRadius: st.radius }}>
                  <Photo src={g.fields.image} alt={g.fields.alt || ''} toneKey={g.id} />
                </div>
                {g.fields.caption && <figcaption className="font-medium text-[15px] leading-[1.4] text-muted">{g.fields.caption}</figcaption>}
              </figure>
            );
          })}
        </section>
      )}

      {team && team.length > 0 && (
        <section aria-labelledby="ab-team" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pb-[clamp(64px,8vw,112px)]">
          <h2 id="ab-team" className="font-display text-[clamp(32px,3.6vw,52px)] leading-[1.04] tracking-[-0.02em] mb-10">
            The people behind the studio
          </h2>
          <ul className="list-none m-0 p-0 grid gap-8 grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))]">
            {team.map((t) => (
              <li key={t.id} className="flex flex-col gap-3">
                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden">
                  <Photo src={t.fields.photo} alt={t.fields.name || ''} toneKey={t.id} />
                </div>
                <strong className="font-display text-[22px] font-normal">{t.fields.name}</strong>
                {t.fields.role && <span className="font-semibold text-xs tracking-[0.14em] uppercase text-clay">{t.fields.role}</span>}
                {t.fields.bio && <p className="text-base leading-relaxed text-muted">{t.fields.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="ab-loc" className="bg-sand py-[clamp(72px,9vw,120px)]">
        <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] grid items-center gap-[clamp(40px,6vw,88px)] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          <div className="flex flex-col gap-5">
            <h2 id="ab-loc" className="font-display text-[clamp(32px,3.6vw,52px)] leading-[1.04] tracking-[-0.02em]">
              Find us in {cityShort}.
            </h2>
            <p className="text-lg leading-relaxed text-body">
              {nameOf(settings)} · {city}
              {(settings.address || settings.hours) && (
                <>
                  <br />
                  <span className="text-muted">{[settings.address, settings.hours].filter(Boolean).join(' · ')}</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/workshops" className={btn.primary}>
                Explore Workshops <span aria-hidden>→</span>
              </Link>
              <Link href="/contact" className={btn.outline}>
                Contact Studio
              </Link>
            </div>
          </div>
          {locImg?.image && (
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
              <Photo src={locImg.image} alt={locImg.alt} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
