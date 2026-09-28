'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api } from '@/lib/api';
import type { Dashboard } from '@/lib/types';
import { AdminError, ListSkeleton, Pill } from '@/components/admin/ui';

const when = (iso: string) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setError(false);
    api.get<Dashboard>('/admin/dashboard', token).then(setData).catch(() => setError(true));
  }, [token]);
  useEffect(load, [load]);

  if (error) return <AdminError message="Could not load the dashboard." onRetry={load} />;
  if (!data) return <ListSkeleton rows={6} />;

  const card = 'bg-cream border border-rule rounded-2xl self-start overflow-hidden';
  return (
    <>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))]">
        {data.metrics.map((m) => (
          <Link key={m.key} href={m.href} className="bg-cream border border-rule rounded-2xl p-5 no-underline text-ink hover:border-clay hover:text-ink">
            <div className="font-bold text-[11px] tracking-[0.14em] uppercase text-muted">{m.key}</div>
            <div className="mt-2 font-display text-[40px] leading-none">{m.value}</div>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))]">
        <div className={card}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-rule">
            <h2 className="text-[17px] font-semibold">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="font-semibold text-sm">View all</Link>
          </div>
          {data.recentInquiries.length === 0 ? (
            <p className="px-5 py-8 text-muted text-[15px] leading-relaxed">No inquiries yet. Messages from the Home and Contact forms — and every “Ask About…” button — appear here.</p>
          ) : (
            data.recentInquiries.map((r) => (
              <Link key={r.id} href={`/admin/inquiries?open=${r.id}`} className="flex justify-between gap-3 px-5 py-3.5 border-b border-linen no-underline text-ink hover:bg-paper hover:text-ink">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold">
                    {r.name} <span className="font-normal text-muted">· {r.type}</span>
                  </span>
                  <span className="text-sm text-body truncate">{r.subject || r.message}</span>
                </div>
                <span className="self-center text-xs text-muted whitespace-nowrap">{when(r.createdAt)}</span>
              </Link>
            ))
          )}
        </div>
        <div className={card}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-rule">
            <h2 className="text-[17px] font-semibold">Recent registrations</h2>
            <Link href="/admin/registrations" className="font-semibold text-sm">View all</Link>
          </div>
          {data.recentRegistrations.length === 0 ? (
            <p className="px-5 py-8 text-muted text-[15px] leading-relaxed">No workshop registrations yet.</p>
          ) : (
            data.recentRegistrations.map((r) => (
              <Link key={r.id} href="/admin/registrations" className="flex justify-between gap-3 px-5 py-3.5 border-b border-linen no-underline text-ink hover:bg-paper hover:text-ink">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold">
                    {r.name} <span className="font-normal text-muted">· {r.attendees} {r.attendees === 1 ? 'person' : 'people'}</span>
                  </span>
                  <span className="text-sm text-body truncate">{r.workshopTitle}</span>
                </div>
                <span className="self-center text-xs text-muted capitalize">{r.status}</span>
              </Link>
            ))
          )}
        </div>
        <div className={card}>
          <div className="px-5 py-4 border-b border-rule">
            <h2 className="text-[17px] font-semibold">Before launch</h2>
          </div>
          {data.checklist.map((c) => (
            <Link key={c.name} href={c.href} className="flex justify-between items-center gap-3 min-h-[52px] px-5 border-b border-linen no-underline text-[15px] text-ink hover:bg-paper hover:text-ink">
              {c.name}
              <Pill tone={c.tone}>{c.status}</Pill>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
