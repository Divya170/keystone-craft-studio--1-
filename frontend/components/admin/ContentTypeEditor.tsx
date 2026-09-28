'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api, ApiError, mediaUrl, uploadFile } from '@/lib/api';
import { ContentBlock, ContentType } from '@/lib/types';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'checkbox' | 'select' | 'imageList' | 'readonly';
  optional?: boolean;
  options?: { value: string; label: string }[];
  maxItems?: number;
}

export function ContentTypeEditor({
  type,
  title,
  fieldDefs,
  allowCreate = true,
  allowDelete = true,
  itemLabel,
  emptyMessage = 'Nothing here yet.',
}: {
  type: ContentType;
  title: string;
  fieldDefs: FieldDef[];
  allowCreate?: boolean;
  allowDelete?: boolean;
  itemLabel: (fields: Record<string, any>, index: number) => string;
  emptyMessage?: string;
}) {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    api
      .get<ContentBlock[]>(`/admin/content?type=${type}`, token)
      .then((res) => setItems(res.sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError('Could not load content. Refresh to try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, type]);

  const defaultFor = (f: FieldDef) => {
    if (f.type === 'checkbox') return false;
    if (f.type === 'imageList') return [];
    return '';
  };

  const startEdit = (item: ContentBlock) => {
    setEditingId(item.id);
    setDraft({ ...item.fields });
    setError('');
  };

  const startCreate = () => {
    setEditingId('__new__');
    setDraft(Object.fromEntries(fieldDefs.map((f) => [f.key, defaultFor(f)])));
    setError('');
  };

  async function onUpload(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setUploadingKey(key);
    try {
      const { url } = await uploadFile(file, token);
      setDraft((d) => ({ ...d, [key]: url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploadingKey(null);
    }
  }

  async function onUploadListItem(key: string, index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setUploadingKey(`${key}-${index}`);
    try {
      const { url } = await uploadFile(file, token);
      setDraft((d) => {
        const list = [...(d[key] || [])];
        list[index] = { ...(list[index] || {}), url };
        return { ...d, [key]: list };
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploadingKey(null);
    }
  }

  function addListItem(key: string) {
    setDraft((d) => ({ ...d, [key]: [...(d[key] || []), { url: null, alt: '' }] }));
  }
  function removeListItem(key: string, index: number) {
    setDraft((d) => ({ ...d, [key]: (d[key] || []).filter((_: any, i: number) => i !== index) }));
  }
  function setListItemAlt(key: string, index: number, alt: string) {
    setDraft((d) => {
      const list = [...(d[key] || [])];
      list[index] = { ...(list[index] || {}), alt };
      return { ...d, [key]: list };
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    const missing = fieldDefs.find(
      (f) => !f.optional && (f.type === 'text' || f.type === 'textarea' || f.type === 'select') && !String(draft[f.key] ?? '').trim(),
    );
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    try {
      if (editingId === '__new__') {
        await api.post('/admin/content', { type, fields: draft, published: true }, token);
      } else if (editingId) {
        await api.put(`/admin/content/${editingId}`, { fields: draft }, token);
      }
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
    }
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm('Delete this item? This removes it from the website.')) return;
    try {
      await api.delete(`/admin/content/${id}`, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete.');
    }
  }

  async function togglePublished(item: ContentBlock) {
    if (!token) return;
    try {
      await api.put(`/admin/content/${item.id}`, { published: !item.published }, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update.');
    }
  }

  async function move(item: ContentBlock, dir: -1 | 1) {
    if (!token) return;
    const idx = items.findIndex((i) => i.id === item.id);
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    try {
      await api.post('/admin/content/reorder', { ids: next.map((i) => i.id) }, token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reorder.');
    }
    load();
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-xl font-semibold">{title}</h2>
        {allowCreate && (
          <button type="button" onClick={startCreate} className="px-3 py-1.5 bg-ink text-white text-sm font-semibold">
            + Add
          </button>
        )}
      </div>

      {error && !editingId && <div role="alert" className="text-sm text-err">{error}</div>}

      {editingId && (
        <form onSubmit={save} className="bg-cream border border-rule p-4 grid gap-3.5 max-w-xl">
          {error && <div role="alert" className="text-sm text-err">{error}</div>}
          <p className="m-0 text-xs font-mono tracking-[0.1em] text-muted">{editingId === '__new__' ? 'NEW ITEM' : 'EDIT ITEM'}</p>
          {fieldDefs.map((f) => (
            <div key={f.key} className="grid gap-1.5">
              <label className="text-sm font-semibold">
                {f.label} {f.optional && <span className="font-normal text-muted">(optional)</span>}
              </label>
              {f.type === 'textarea' && (
                <textarea rows={3} value={draft[f.key] || ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className="px-3 py-2 border border-rule" />
              )}
              {f.type === 'readonly' && <p className="min-h-11 px-3 flex items-center border border-rule bg-paper text-muted m-0">{String(draft[f.key] ?? '')}</p>}
              {f.type === 'text' && (
                <input value={draft[f.key] || ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className="min-h-11 px-3 border border-rule" />
              )}
              {f.type === 'select' && (
                <select value={draft[f.key] || ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className="min-h-11 px-3 border border-rule bg-cream">
                  <option value="">— Select —</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              {f.type === 'checkbox' && (
                <input type="checkbox" checked={!!draft[f.key]} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.checked }))} className="w-5 h-5 accent-clay justify-self-start" />
              )}
              {f.type === 'image' && (
                <div className="flex items-center gap-3">
                  {draft[f.key] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(draft[f.key]) || undefined} alt="" className="w-16 h-16 object-cover border border-edge" />
                  )}
                  <label className="px-3 py-2 border border-dashed border-rule text-sm cursor-pointer">
                    {uploadingKey === f.key ? 'Uploading…' : draft[f.key] ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(f.key, e)} disabled={uploadingKey === f.key} />
                  </label>
                  {draft[f.key] && (
                    <button type="button" onClick={() => setDraft((d) => ({ ...d, [f.key]: null }))} className="text-sm text-err underline">
                      Remove
                    </button>
                  )}
                </div>
              )}
              {f.type === 'imageList' && (
                <div className="grid gap-2.5">
                  {((draft[f.key] || []) as { url: string | null; alt: string }[]).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-paper p-2.5 border border-rule">
                      {item.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(item.url) || undefined} alt="" className="w-14 h-14 object-cover border border-edge flex-none" />
                      )}
                      <label className="px-2.5 py-2 border border-dashed border-rule text-xs cursor-pointer flex-none">
                        {uploadingKey === `${f.key}-${i}` ? 'Uploading…' : item.url ? 'Replace' : 'Upload'}
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onUploadListItem(f.key, i, e)} disabled={uploadingKey === `${f.key}-${i}`} />
                      </label>
                      <input
                        placeholder="Alt text"
                        value={item.alt || ''}
                        onChange={(e) => setListItemAlt(f.key, i, e.target.value)}
                        className="min-h-9 px-2.5 border border-rule flex-1 min-w-0 text-sm"
                      />
                      <button type="button" onClick={() => removeListItem(f.key, i)} className="text-xs text-err underline flex-none">
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!f.maxItems || (draft[f.key] || []).length < f.maxItems) && (
                    <button type="button" onClick={() => addListItem(f.key)} className="justify-self-start px-3 py-1.5 border border-ink text-xs font-semibold">
                      + Add image
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-ink text-white text-sm font-semibold">
              Save
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 border border-ink text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-cream border border-rule p-4 grid gap-2 animate-pulse">
          <span className="h-4 w-1/2 bg-line" />
          <span className="h-4 w-2/3 bg-line" />
          <span className="h-4 w-1/3 bg-line" />
        </div>
      ) : (
        <div className="bg-cream border border-rule divide-y divide-rule">
          {items.length === 0 && <p className="p-4 text-sm text-muted">{emptyMessage}</p>}
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-0.5">
                  <button type="button" disabled={i === 0} onClick={() => move(item, -1)} className="text-xs disabled:opacity-30">
                    ▲
                  </button>
                  <button type="button" disabled={i === items.length - 1} onClick={() => move(item, 1)} className="text-xs disabled:opacity-30">
                    ▼
                  </button>
                </div>
                <span className="truncate font-medium">{itemLabel(item.fields, i)}</span>
                {!item.published && <span className="text-xs px-1.5 py-0.5 bg-linen text-muted flex-none">Hidden</span>}
              </div>
              <div className="flex gap-2 flex-none">
                <button type="button" onClick={() => togglePublished(item)} className="px-3 py-1.5 border border-ink text-xs font-semibold">
                  {item.published ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={() => startEdit(item)} className="px-3 py-1.5 border border-ink text-xs font-semibold">
                  Edit
                </button>
                {allowDelete && (
                  <button type="button" onClick={() => remove(item.id)} className="px-3 py-1.5 border border-err text-err text-xs font-semibold">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
