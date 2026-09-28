import type { SiteImages, Settings } from '@/lib/types';
import type { InquiryValues } from '@/lib/validation';
import { cityOf, contactRows, nameOf } from '@/lib/studio';
import { Photo } from './Photo';
import { InquiryForm } from './forms/InquiryForm';

const dt = 'font-bold text-xs leading-[1.9] tracking-[0.16em] uppercase text-muted';

/** "say hello" block shared by Home and Contact. */
export function ContactBlock({ settings, images, heading, prefill }: { settings: Settings | null; images: SiteImages | null; heading: string; prefill?: Partial<InquiryValues> }) {
  const mood = images?.['contact-moodboard'];
  return (
    <section id="contact-block" aria-labelledby="contact-title" className="bg-sand py-[clamp(72px,9vw,120px)]">
      <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] grid gap-[clamp(40px,6vw,88px)] items-start grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))]">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p className="font-hand font-semibold text-[30px] leading-none text-clay -rotate-2 origin-left">say hello</p>
            <h2 id="contact-title" className="font-display text-[clamp(34px,4vw,56px)] leading-[1.03] tracking-[-0.02em] text-balance">
              {heading}
            </h2>
          </div>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-7 gap-y-4 text-base leading-normal">
            <dt className={dt}>Visit</dt>
            <dd className="m-0">
              {nameOf(settings)}
              <br />
              {cityOf(settings)}
              {settings?.address && (
                <>
                  <br />
                  {settings.address}
                </>
              )}
            </dd>
            {contactRows(settings).map((r) => (
              <div key={r.k} className="contents">
                <dt className={dt}>{r.k}</dt>
                <dd className="m-0 whitespace-pre-line">{r.href ? <a href={r.href}>{r.v}</a> : r.v}</dd>
              </div>
            ))}
          </dl>
          {mood?.image && (
            <div className="relative aspect-[16/10] rounded-[24px_24px_24px_120px] overflow-hidden">
              <Photo src={mood.image} alt={mood.alt} />
            </div>
          )}
        </div>
        <div id="contact-form" className="scroll-mt-24 bg-cream rounded-[28px] p-[clamp(24px,3.5vw,48px)]">
          <InquiryForm key={`${prefill?.type || ''}|${prefill?.ref || ''}`} prefill={prefill} />
        </div>
      </div>
    </section>
  );
}
