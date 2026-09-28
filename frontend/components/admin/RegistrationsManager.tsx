'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import type { Registration, RegistrationStatus, Workshop } from '@/lib/types';
import { REGISTRATION_STATUSES } from '@/lib/types';
import { AdminEmpty, AdminError, ListSkeleton, Pill, aBtn, aInput, useFlash } from '@/components/admin/ui';
import { useRefreshBadge } from '@/components/admin/badge';

const STATUS_TONE: Record<RegistrationStatus, 'good' | 'warn' | 'off'> = {
  new: 'warn',
  confirmed: 'good',
  waitlisted: 'warn',
  cancelled: 'off',
};
const when = (iso: string) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function RegistrationsManager() {
  const { token } = useAdminAuth();
  const refreshBadge = useRefreshBadge();
  const { flash, node } = useFlash();

  const [items, setItems] = useState<Registration[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<RegistrationStatus>('new');
  const [saving, setSaving] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    if (token) api.get<Workshop[]>('/admin/workshops', token).then(setWorkshops).catch(() => {});
  }, [token]);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (workshopId) params.set('workshopId', workshopId);
    if (q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    api
      .get<Registration[]>(`/admin/registrations${qs ? `?${qs}` : ''}`, token)
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, status, workshopId, q]);

  const openItem = items.find((i) => i.id === openId) || null;
  useEffect(() => {
    if (openItem) {
      setNotesDraft(openItem.adminNotes || '');
      setStatusDraft(openItem.status);
      setDetailError('');
    }
  }, [openItem?.id]);

  async function save() {
    if (!openId || !token) return;
    setSaving(true);
    setDetailError('');
    try {
      await api.put(`/admin/registrations/${openId}`, { status: statusDraft, adminNotes: notesDraft }, token);
      flash('Registration updated.');
      refreshBadge();
      setOpenId(null);
      load();
    } catch (err) {
      setDetailError(errorInfo(err, 'Could not save this registration.').message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/registrations/${id}`, token);
      flash('Registration deleted.');
      refreshBadge();
      setOpenId(null);
      load();
    } catch (err) {
      setDetailError(errorInfo(err, 'Could not delete this registration.').message);
    }
  }

  return (
    <div className="grid gap-4">
      {node}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${aInput} w-auto`}>
          <option value="">All statuses</option>
          {REGISTRATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)} className={`${aInput} w-auto max-w-[220px]`}>
          <option value="">All workshops</option>
          {workshops.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
        <input placeholder="Search name, email, reference…" value={q} onChange={(e) => setQ(e.target.value)} className={`${aInput} max-w-xs`} />
      </div>

      {error ? (
        <AdminError message="Could not load registrations." onRetry={load} />
      ) : loading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <AdminEmpty>No registrations match these filters.</AdminEmpty>
      ) : (
        <div className="bg-cream border border-rule rounded-2xl overflow-hidden divide-y divide-rule">
          {items.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="w-full text-left flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-transparent border-0 cursor-pointer hover:bg-paper"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-semibold text-ink">
                  {r.name} <span className="font-normal text-muted">· {r.attendees} {r.attendees === 1 ? 'person' : 'people'}</span>
                </span>
                <span className="text-sm text-body truncate max-w-[52ch]">{r.workshopTitle}</span>
              </div>
              <div className="flex items-center gap-3 flex-none">
                <span className="text-xs text-muted whitespace-nowrap">{when(r.createdAt)}</span>
                <Pill tone={STATUS_TONE[r.status]}>{r.status}</Pill>
              </div>
            </button>
          ))}
        </div>
      )}

      {openItem && (
        <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
          <button aria-label="Close" onClick={() => setOpenId(null)} className="absolute inset-0 bg-ink/40 border-0 cursor-pointer" />
          <div className="relative z-10 w-full max-w-md h-full bg-cream p-6 overflow-auto flex flex-col gap-4 shadow-[-12px_0_30px_rgba(7,18,31,.15)]">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-xs font-mono tracking-[0.1em] text-muted m-0">{openItem.reference}</p>
                <h2 className="text-xl font-semibold m-0">{openItem.name}</h2>
                <p className="text-sm text-muted m-0">{openItem.email}</p>
              </div>
              <button type="button" onClick={() => setOpenId(null)} className={aBtn.icon} aria-label="Close">
                ✕
              </button>
            </div>
            {detailError && <AdminError message={detailError} />}
            <div className="grid gap-1 text-sm">
              <span className="font-semibold">Workshop</span>
              <span>{openItem.workshopTitle}</span>
            </div>
            <div className="grid gap-1 text-sm">
              <span className="font-semibold">Attendees</span>
              <span>{openItem.attendees}</span>
            </div>
            {openItem.message && (
              <div className="grid gap-1 text-sm">
                <span className="font-semibold">Message</span>
                <p className="m-0 whitespace-pre-wrap leading-relaxed bg-paper border border-rule rounded-xl p-3">{openItem.message}</p>
              </div>
            )}
            <div className="grid gap-1 text-sm">
              <span className="font-semibold">Received</span>
              <span>{when(openItem.createdAt)}</span>
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Status</span>
              <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as RegistrationStatus)} className={aInput}>
                {REGISTRATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {statusDraft === 'cancelled' && openItem.status !== 'cancelled' && (
                <span className="text-xs text-muted">Cancelling frees this person's spot back up for the workshop.</span>
              )}
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Admin notes</span>
              <textarea rows={4} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} className="px-3 py-2 rounded-[10px] border-[1.5px] border-edge bg-field text-ink" />
            </label>
            <div className="flex gap-2 mt-auto pt-2">
              <button type="button" onClick={save} disabled={saving} className={aBtn.primary}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => remove(openItem.id)} className={aBtn.danger}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
