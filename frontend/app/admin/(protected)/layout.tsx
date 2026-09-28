'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api } from '@/lib/api';
import { BadgeCtx } from '@/components/admin/badge';

const NAV: { href: string; label: string; exact?: boolean; badge?: 'inquiries' | 'registrations' }[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/inquiries', label: 'Inquiries', badge: 'inquiries' },
  { href: '/admin/registrations', label: 'Registrations', badge: 'registrations' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/workshops', label: 'Workshops' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { token, admin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [badges, setBadges] = useState({ inquiries: 0, registrations: 0 });
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) router.replace('/admin/login');
  }, [loading, token, router]);

  const refreshBadge = useCallback(() => {
    if (!token) return;
    api
      .get<{ inquiries: number; registrations: number }>('/admin/dashboard/badges', token)
      .then(setBadges)
      .catch(() => {});
  }, [token]);

  useEffect(refreshBadge, [refreshBadge, pathname]);
  useEffect(() => setNavOpen(false), [pathname]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted">Loading…</div>;
  if (!token) return null;

  const current = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));

  return (
    <BadgeCtx.Provider value={refreshBadge}>
      <div className="min-h-screen flex flex-col">
        <div className="bg-ink text-paper h-16 px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              aria-controls="admin-nav"
              aria-label="Admin menu"
              className="lg:hidden w-10 h-10 rounded-full border border-paper/30 bg-transparent text-paper cursor-pointer"
            >
              ☰
            </button>
            <span aria-hidden className="w-5 h-6 bg-[#D9825C]" style={{ clipPath: 'polygon(0 0,100% 0,78% 100%,22% 100%)' }} />
            <strong className="font-display font-normal text-lg">Keystone · Admin</strong>
          </div>
          <Link href="/" className="text-paper hover:text-peach text-sm">
            View site →
          </Link>
        </div>
        <div className="flex-1 flex items-stretch">
          <nav
            id="admin-nav"
            aria-label="Admin"
            className={`${navOpen ? 'flex' : 'hidden'} lg:flex fixed lg:static inset-x-0 top-16 bottom-0 z-20 lg:z-auto w-full lg:w-60 flex-none bg-ink px-3 py-4 flex-col gap-0.5 overflow-auto`}
          >
            <span className="font-bold text-[11px] tracking-[0.16em] uppercase text-peach px-3 py-2">Manage</span>
            {NAV.map((n) => {
              const on = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              const count = n.badge ? badges[n.badge] : 0;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={on ? 'page' : undefined}
                  className="flex items-center justify-between gap-2 min-h-11 px-3 rounded-full no-underline text-[15px] font-medium hover:text-paper"
                  style={{ background: on ? '#3E4A36' : 'transparent', color: on ? '#F3ECE1' : '#D8CCBB' }}
                >
                  {n.label}
                  {count > 0 && (
                    <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-clay text-cream text-xs font-bold flex items-center justify-center" aria-label={`${count} new`}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="mt-auto pt-6 px-3 flex flex-col gap-2 border-t border-paper/15">
              <span className="text-sm text-oat truncate">{admin?.email}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/admin/login');
                }}
                className="text-left text-sm font-semibold text-paper underline underline-offset-4 bg-transparent border-0 cursor-pointer p-0"
              >
                Sign out
              </button>
            </div>
          </nav>
          <main className="flex-1 min-w-0 p-5 md:p-[clamp(20px,3vw,40px)] flex flex-col gap-6">
            <h1 className="font-display text-[clamp(30px,3vw,40px)] leading-tight">{current?.label || 'Admin'}</h1>
            {children}
          </main>
        </div>
      </div>
    </BadgeCtx.Provider>
  );
}
