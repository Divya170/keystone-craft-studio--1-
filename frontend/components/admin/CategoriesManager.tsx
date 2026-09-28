'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api, mediaUrl } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import type { Category } from '@/lib/types';
import { AdminEmpty, AdminError, ImageField, ListSkeleton, Pill, Switch, aBtn, aInput, moved, useFlash } from '@/components/admin/ui';

interface Draft {
  name: string;
  description: string;
  image: string | null;
  imageAlt: string;
  published: boolean;
}

const emptyDraft: Draft = { name: '', description: '', image: null, imageAlt: '', published: false };

export function CategoriesManager() {
  const { token } = useAdminAuth();
  const { flash, node } = useFlash();
  const [items, setItems] = useState<Category[]>([]);
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
      .get<Category[]>('/admin/categories', token)
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setDraft({ name: c.name, description: c.description || '', image: c.image, imageAlt: c.imageAlt || '', published: c.published });
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
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      image: draft.image,
      imageAlt: draft.imageAlt.trim() || null,
      published: draft.published,
    };
    try {
      if (editingId === '__new__') await api.post('/admin/categories', payload, token);
      else await api.put(`/admin/categories/${editingId}`, payload, token);
      flash(editingId === '__new__' ? 'Category created.' : 'Category saved.');
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(errorInfo(err, 'Could not save this category.').message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!token) return;
    if (!confirm(`Delete “${c.name}”?`)) return;
    try {
      await api.delete(`/admin/categories/${c.id}`, token);
      flash('Category deleted.');
      load();
    } catch (err) {
      setBanner(errorInfo(err, 'Could not delete this category.').message);
    }
  }

  async function move(i: number, dir: -1 | 1) {
    if (!token) return;
    const ids = moved(items, i, dir);
    if (!ids) return;
    const next = ids.map((id) => items.find((c) => c.id === id)!);
    setItems(next);
    try {
      await api.post('/admin/categories/reorder', { ids }, token);
    } catch (err) {
      setBanner(errorInfo(err, 'Could not reorder categories.').message);
      load();
    }
  }

  return (
    <div className="grid gap-4">
      {node}
      <div className="flex justify-between items-center">
        <p className="m-0 text-sm text-muted max-w-prose">Draft categories are hidden on the site until you rename and publish them.</p>
        <button type="button" onClick={startCreate} className={aBtn.accent}>
          + New category
        </button>
      </div>

      {banner && <AdminError message={banner} onRetry={() => setBanner('')} />}

      {editingId && (
        <form onSubmit={save} className="bg-cream border border-rule rounded-2xl p-5 grid gap-4 max-w-xl">
          {formError && <AdminError message={formError} />}
          <p className="m-0 text-xs font-mono tracking-[0.1em] text-muted">{editingId === '__new__' ? 'NEW CATEGORY' : 'EDIT CATEGORY'}</p>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Name</span>
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={aInput} required />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Description</span>
            <input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className={aInput} placeholder="Short descriptor shown on the Home rail" />
          </label>
          <ImageField label="Image" value={draft.image} onChange={(v) => setDraft((d) => ({ ...d, image: v }))} token={token!} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Image alt text</span>
            <input value={draft.imageAlt} onChange={(e) => setDraft((d) => ({ ...d, imageAlt: e.target.value }))} className={aInput} />
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
        <AdminError message="Could not load categories." onRetry={load} />
      ) : loading ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <AdminEmpty>No categories yet.</AdminEmpty>
      ) : (
        <div className="bg-cream border border-rule rounded-2xl overflow-hidden divide-y divide-rule">
          {items.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex flex-col gap-0.5 flex-none">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-xs disabled:opacity-30" aria-label="Move up">
                  ▲
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="text-xs disabled:opacity-30" aria-label="Move down">
                  ▼
                </button>
              </div>
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(c.image) || undefined} alt="" className="w-12 h-12 object-cover rounded-lg border border-edge flex-none" />
              ) : (
                <span className="w-12 h-12 rounded-lg border border-dashed border-edge flex-none" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="font-semibold truncate">{c.name}</span>
                <span className="text-sm text-muted truncate">{c.productCount} product{c.productCount === 1 ? '' : 's'}</span>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <Pill tone={c.published ? 'good' : 'off'}>{c.published ? 'Published' : 'Draft'}</Pill>
                <button type="button" onClick={() => startEdit(c)} className={aBtn.ghost}>
                  Edit
                </button>
                <button type="button" onClick={() => remove(c)} className={aBtn.danger}>
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
