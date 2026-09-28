'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Mark, NAV } from './nav';

export function Header({ city }: { city: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const openBtn = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const isHome = pathname === '/';
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      openBtn.current?.focus();
    };
  }, [menu]);

  const solid = scrolled || !isHome;

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-[10px] backdrop-saturate-[1.2] border-b transition-colors duration-300"
        style={{ background: solid ? 'rgba(243,236,225,.92)' : 'rgba(243,236,225,0)', borderColor: scrolled ? '#DCCDB9' : 'transparent' }}
      >
        <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] h-[76px] flex items-center justify-between gap-6">
          <Link href="/" aria-label="Keystone Craft Studio, home" className="flex items-center gap-3 no-underline text-ink hover:text-ink min-h-11">
            <Mark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[23px] tracking-[-0.01em]">Keystone</span>
              <span className="font-semibold text-[10.5px] tracking-[0.24em] uppercase mt-[5px] text-muted">Craft Studio</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5">
            {NAV.map((l) => {
              const on = active(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? 'page' : undefined}
                  className="flex items-center min-h-11 px-[15px] font-medium text-[15px] text-ink no-underline rounded-full transition-colors hover:bg-linen hover:text-ink"
                  style={{ background: on ? '#E6DACA' : undefined }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            ref={openBtn}
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            className="lg:hidden w-12 h-12 rounded-full border-[1.5px] border-ink bg-transparent cursor-pointer flex flex-col items-center justify-center gap-[5px]"
          >
            <span className="w-[18px] h-[1.5px] bg-ink" />
            <span className="w-[18px] h-[1.5px] bg-ink" />
            <span className="w-3 h-[1.5px] bg-ink ml-1.5" />
          </button>
        </div>
      </header>

      {menu && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[70] bg-paper flex flex-col px-[clamp(20px,4vw,48px)] pt-4 pb-8 overflow-auto">
          <div className="flex justify-between items-center h-[60px]">
            <span className="font-display text-[23px]">Keystone</span>
            <button ref={closeBtn} type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="w-12 h-12 rounded-full border-[1.5px] border-ink bg-transparent cursor-pointer text-[22px] leading-none">
              ×
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col mt-7">
            {NAV.map((l) => {
              const on = active(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? 'page' : undefined}
                  className="flex justify-between items-center min-h-16 border-b-[1.5px] border-dashed border-rule font-display text-[34px] leading-none text-ink no-underline hover:text-ink"
                >
                  {l.label}
                  <span aria-hidden className="font-medium text-xl text-clay">
                    {on ? '●' : '→'}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-8 flex flex-col gap-1.5 font-medium text-[15px] text-muted">
            <span>Keystone Craft Studio</span>
            <span>{city}</span>
          </div>
        </div>
      )}
    </>
  );
}
