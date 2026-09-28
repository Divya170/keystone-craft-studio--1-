'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api, mediaUrl } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import { WORKSHOP_STATUSES, type Workshop, type WorkshopStatus } from '@/lib/types';
import { money } from '@/lib/ui';
import { AdminEmpty, AdminError, ImageField, ListSkeleton, Pill, Switch, aBtn, aInput, moved, useFlash } from '@/components/admin/ui';

const textarea = 'px-3 py-2.5 rounded-[10px] border-[1.5px] border-edge bg-field text-ink text-[15px] focus:outline-none focus:border-clay';

interface Draft {
  title: string;
  summary: string;
  details: string;
  image: string | null;
  imageAlt: string;
  status: WorkshopStatus;
  startsAt: string;
  duration: string;
  price: string;
  capacity: string;
  materials: string;
  location: string;
  published: boolean;
}

const emptyDraft: Draft = {
  title: '',
  summary: '',
  details: '',
  image: null,
  imageAlt: '',
  status: 'Date To Be Announced',
  startsAt: '',
  duration: '',
  price: '',
  capacity: '',
  materials: '',
  location: '',
  published: false,
};

export function WorkshopsManager() {
  const { token } = useAdminAuth();
  const { flash, node } = useFlash();
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [banner, setBanner] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    api
      .get<Workshop[]>('/admin/workshops', token)
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function startEdit(w: Workshop) {
    setEditingId(w.id);
    setDraft({
      title: w.title,
      summary: w.summary || '',
      details: w.details || '',
      image: w.image,
      imageAlt: w.imageAlt || '',
      status: w.status,
      startsAt: w.startsAt || '',
      duration: w.duration || '',
      price: w.price != null ? String(w.price) : '',
      capacity: w.capacity != null ? String(w.capacity) : '',
      materials: w.materials || '',
      location: w.location || '',
      published: w.published,
    });
    setFormError('');
  }
  function startCreate() {
    setEditingId('__new__');
    setDraft(emptyDraft);
    setFormError('');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError('');
    const payload = {
      title: draft.title.trim(),
      summary: draft.summary.trim() || null,
      details: draft.details.trim() || null,
      image: draft.image,
      imageAlt: draft.imageAlt.trim() || null,
      status: draft.status,
      startsAt: draft.startsAt.trim() || null,
      duration: draft.duration.trim() || null,
      price: draft.price.trim() === '' ? null : Number(draft.price),
      capacity: draft.capacity.trim() === '' ? null : Number(draft.capacity),
      materials: draft.materials.trim() || null,
      location: draft.location.trim() || null,
      published: draft.published,
    };
    try {
      if (editingId === '__new__') await api.post('/admin/workshops', payload, token);
      else await api.put(`/admin/workshops/${editingId}`, payload, token);
      flash(editingId === '__new__' ? 'Workshop created.' : 'Workshop saved.');
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(errorInfo(err, 'Could not save this workshop.').message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(w: Workshop) {
    if (!token) return;
    if (!confirm(`Delete “${w.title}”?`)) return;
    try {
      await api.delete(`/admin/workshops/${w.id}`, token);
      flash('Workshop deleted.');
      load();
    } catch (err) {
      setBanner(errorInfo(err, 'Could not delete this workshop.').message);
    }
  }

  async function move(i: number, dir: -1 | 1) {
    if (!token) return;
    const ids = moved(items, i, dir);
    if (!ids) return;
    const next = ids.map((id) => items.find((w) => w.id === id)!);
    setItems(next);
    try {
      await api.post('/admin/workshops/reorder', { ids }, token);
    } catch (err) {
      setBanner(errorInfo(err, 'Could not reorder workshops.').message);
      load();
    }
  }

  return (
    <div className="grid gap-4">
      {node}
      <div className="flex justify-between items-center">
        <p className="m-0 text-sm text-muted max-w-prose">Draft workshops are hidden on the site until you fill them in and publish them.</p>
        <button type="button" onClick={startCreate} className={aBtn.accent}>
          + New workshop
        </button>
      </div>

      {banner && <AdminError message={banner} onRetry={() => setBanner('')} />}

      {editingId && (
        <form onSubmit={save} className="bg-cream border border-rule rounded-2xl p-5 grid gap-4 max-w-xl">
          {formError && <AdminError message={formError} />}
          <p className="m-0 text-xs font-mono tracking-[0.1em] text-muted">{editingId === '__new__' ? 'NEW WORKSHOP' : 'EDIT WORKSHOP'}</p>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Title</span>
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className={aInput} required />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Summary</span>
            <textarea rows={2} value={draft.summary} onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))} className={textarea} placeholder="What participants make, and who it suits" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Details</span>
            <textarea rows={4} value={draft.details} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} className={textarea} placeholder="What to expect" />
          </label>
          <ImageField label="Image" value={draft.image} onChange={(v) => setDraft((d) => ({ ...d, image: v }))} token={token!} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Image alt text</span>
            <input value={draft.imageAlt} onChange={(e) => setDraft((d) => ({ ...d, imageAlt: e.target.value }))} className={aInput} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Status</span>
            <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as WorkshopStatus }))} className={aInput}>
              {WORKSHOP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Starts at <span className="font-normal text-muted">(optional)</span></span>
              <input
                value={draft.startsAt}
                onChange={(e) => setDraft((d) => ({ ...d, startsAt: e.target.value }))}
                className={aInput}
                placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:mm"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Duration <span className="font-normal text-muted">(optional)</span></span>
              <input value={draft.duration} onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))} className={aInput} placeholder="e.g. 3 hours" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Price <span className="font-normal text-muted">(optional)</span></span>
              <input type="number" min={0} step="0.01" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} className={aInput} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Capacity <span className="font-normal text-muted">(optional)</span></span>
              <input type="number" min={1} step="1" value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))} className={aInput} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Materials <span className="font-normal text-muted">(optional)</span></span>
            <input value={draft.materials} onChange={(e) => setDraft((d) => ({ ...d, materials: e.target.value }))} className={aInput} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Location <span className="font-normal text-muted">(optional — blank shows the studio address)</span></span>
            <input value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} className={aInput} />
          </label>
          <Switch checked={draft.published} onChange={() => setDraft((d) => ({ ...d, published: !d.published }))} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={aBtn.primary}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className={aBtn.ghost}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {error ? (
        <AdminError message="Could not load workshops." onRetry={load} />
      ) : loading ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <AdminEmpty>No workshops yet.</AdminEmpty>
      ) : (
        <div className="bg-cream border border-rule rounded-2xl overflow-hidden divide-y divide-rule">
          {items.map((w, i) => (
            <div key={w.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex flex-col gap-0.5 flex-none">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-xs disabled:opacity-30" aria-label="Move up">
                  ▲
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="text-xs disabled:opacity-30" aria-label="Move down">
                  ▼
                </button>
              </div>
              {w.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(w.image) || undefined} alt="" className="w-12 h-12 object-cover rounded-lg border border-edge flex-none" />
              ) : (
                <span className="w-12 h-12 rounded-lg border border-dashed border-edge flex-none" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="font-semibold truncate">{w.title}</span>
                <span className="text-sm text-muted truncate">
                  {w.status}
                  {w.price != null ? ` · ${money(w.price)}` : ''}
                  {w.capacity != null ? ` · ${w.booked}/${w.capacity} booked${w.full ? ' (full)' : ''}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Pill tone={w.published ? 'good' : 'off'}>{w.published ? 'Published' : 'Draft'}</Pill>
                <button type="button" onClick={() => startEdit(w)} className={aBtn.ghost}>
                  Edit
                </button>
                <button type="button" onClick={() => remove(w)} className={aBtn.danger}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
