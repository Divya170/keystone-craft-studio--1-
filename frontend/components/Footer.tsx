import Link from 'next/link';
import type { Settings } from '@/lib/types';
import { cityOf, nameOf } from '@/lib/studio';
import { Mark, NAV } from './nav';

const head = 'font-bold text-xs tracking-[0.16em] uppercase text-peach mb-2.5';

export function Footer({ settings }: { settings: Settings | null }) {
  const s = settings;
  const socials = s?.socialLinks || [];
  return (
    <footer className="bg-ink text-paper pt-[clamp(64px,8vw,104px)] pb-8">
      <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] grid gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))' }}>
        <div className="flex flex-col gap-3.5">
          <span className="flex items-center gap-3">
            <Mark color="#D9825C" />
            <span className="font-display text-[28px] leading-none">Keystone</span>
          </span>
          <span className="text-[15px] leading-[1.55] text-oat">
            Handmade goods + creative workshops.
            <br />
            {cityOf(s)}.
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-0.5">
          <span className={head}>Explore</span>
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center min-h-9 font-medium text-[15px] text-paper no-underline hover:text-peach">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5 text-[15px] leading-[1.55] text-oat">
          <span className={head}>Visit</span>
          <span>{cityOf(s)}</span>
          {s?.address && <span>{s.address}</span>}
          {s?.hours && <span className="whitespace-pre-line">{s.hours}</span>}
        </div>
        <div className="flex flex-col gap-2.5 text-[15px] leading-[1.55] text-oat">
          <span className={head}>Contact</span>
          {s?.email && (
            <a href={`mailto:${s.email}`} className="text-oat hover:text-peach">
              {s.email}
            </a>
          )}
          {s?.phone && (
            <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="text-oat hover:text-peach">
              {s.phone}
            </a>
          )}
          <Link href="/contact#contact-form" className="text-paper font-semibold hover:text-peach">
            Send an inquiry →
          </Link>
        </div>
      </div>
      <div className="max-w-content mx-auto mt-14 pt-6 px-[clamp(20px,4vw,48px)] border-t-[1.5px] border-dashed border-paper/25 flex flex-wrap justify-between gap-3 text-sm text-edge">
        <span>
          © {new Date().getFullYear()} {nameOf(s)}
        </span>
        {socials.length > 0 && (
          <nav aria-label="Social" className="flex flex-wrap gap-4">
            {socials.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="text-edge hover:text-peach">
                {l.label}
              </a>
            ))}
          </nav>
        )}
        <Link href="/admin" className="text-edge hover:text-peach">
          Admin
        </Link>
      </div>
    </footer>
  );
}
