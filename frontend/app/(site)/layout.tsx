import { load } from '@/lib/server';
import type { Settings } from '@/lib/types';
import { cityOf } from '@/lib/studio';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await load<Settings>('/settings');
  return (
    <>
      <a
        href="#main"
        className="absolute left-3 -top-16 focus:top-3 z-[100] bg-ink text-paper px-[18px] py-3 rounded-[10px] font-semibold text-[15px] no-underline"
      >
        Skip to content
      </a>
      <Header city={cityOf(settings)} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
