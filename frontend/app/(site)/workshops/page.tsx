import { load } from '@/lib/server';
import type { Settings, SiteImages, Workshop } from '@/lib/types';
import { cityOf, nameOf } from '@/lib/studio';
import { eyebrow } from '@/lib/ui';
import { Photo } from '@/components/Photo';
import { LoadError } from '@/components/States';
import { WorkshopsView } from './WorkshopsView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Workshops' };

export default async function WorkshopsPage({ searchParams }: { searchParams: { workshop?: string } }) {
  const [workshops, images, settings] = await Promise.all([load<Workshop[]>('/workshops'), load<SiteImages>('/content/site-images'), load<Settings>('/settings')]);
  if (!workshops) return <LoadError what="workshops" />;
  const hero = images?.['workshops-hero'];
  const studioLocation = `${nameOf(settings)}, ${settings?.address ? settings.address + ', ' : ''}${cityOf(settings).replace(', Pennsylvania', ', PA')}`;

  return (
    <>
      <section aria-labelledby="wsp-title" className="max-w-wide mx-auto px-[clamp(12px,2vw,24px)] pt-[clamp(12px,2vw,24px)]">
        <div className="relative h-[clamp(360px,62vh,640px)] rounded-[32px] overflow-hidden">
          <Photo src={hero?.image} alt={hero?.alt || 'A workshop at the studio'} toneKey="ws-hero" eager imgClassName="object-[center_62%]" />
        </div>
        <div className="relative mt-[clamp(-200px,-14vw,-100px)] mr-auto ml-[clamp(0px,4vw,56px)] max-w-[680px] bg-paper rounded-[28px_28px_28px_4px] p-[clamp(28px,4vw,52px)] flex flex-col gap-[18px]">
          <p className={eyebrow}>Workshops</p>
          <h1 id="wsp-title" className="font-display text-[clamp(44px,6vw,88px)] leading-[.98] tracking-[-0.025em]">
            Learn it by hand.
          </h1>
          <p className="text-lg leading-relaxed text-body max-w-[30em]">
            Pick a workshop, register with a short form, and the studio will be in touch by email with the details.
          </p>
        </div>
      </section>
      <WorkshopsView workshops={workshops} initialSlug={searchParams.workshop} studioLocation={studioLocation} />
    </>
  );
}
