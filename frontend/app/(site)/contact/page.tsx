import { load } from '@/lib/server';
import type { Settings, SiteImages } from '@/lib/types';
import { cityOf } from '@/lib/studio';
import { eyebrow } from '@/lib/ui';
import { mediaUrl } from '@/lib/api';
import { ContactBlock } from '@/components/ContactBlock';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact' };

const TYPES = ['product', 'workshop', 'general'];

export default async function ContactPage({ searchParams }: { searchParams: { type?: string; ref?: string } }) {
  const [settings, images] = await Promise.all([load<Settings>('/settings'), load<SiteImages>('/content/site-images')]);
  const prefill = {
    type: searchParams.type && TYPES.includes(searchParams.type) ? searchParams.type : '',
    ref: (searchParams.ref || '').slice(0, 120),
  };
  const map = mediaUrl(settings?.mapImage);
  const city = cityOf(settings);

  return (
    <>
      <section
        aria-labelledby="ct-title"
        className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] pt-[clamp(40px,6vw,96px)] pb-[clamp(32px,4vw,56px)] grid gap-6 items-end grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]"
      >
        <div className="flex flex-col gap-[18px]">
          <p className={eyebrow}>Contact</p>
          <h1 id="ct-title" className="font-display text-[clamp(44px,6vw,88px)] leading-[.98] tracking-[-0.025em]">
            Get in touch.
          </h1>
        </div>
        <p className="text-lg leading-relaxed text-body max-w-[30em]">
          Questions about a piece, a workshop, or visiting — send a note and the studio will reply by email.
        </p>
      </section>

      <ContactBlock settings={settings} images={images} heading="Visit, write, or call." prefill={prefill} />

      <section aria-label="Map" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(56px,7vw,96px)]">
        {map ? (
          <a
            href={settings?.mapUrl || `https://www.google.com/maps/search/${encodeURIComponent(`${settings?.address || ''} ${city}`.trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block min-h-[220px] aspect-[21/9] rounded-3xl overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={map} alt={`Map of the studio, ${city}`} className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute right-4 bottom-4 px-4 py-2.5 rounded-full bg-cream text-ink font-semibold text-sm group-hover:bg-white">Open in Maps ↗</span>
          </a>
        ) : (
          <div className="rounded-3xl border-[1.5px] border-dashed border-edge min-h-[220px] flex flex-col items-center justify-center gap-2.5 text-center p-6 tone-oat">
            <span className="font-display text-2xl leading-[1.2]">{city}</span>
            {settings?.address && <span className="text-base text-body">{settings.address}</span>}
          </div>
        )}
      </section>
    </>
  );
}
