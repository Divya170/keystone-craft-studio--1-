'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import type { Category, Product } from '@/lib/types';
import { money } from '@/lib/ui';
import { AdminEmpty, AdminError, ListSkeleton, Pill, aBtn, aInput, moved, useFlash } from '@/components/admin/ui';

export function ProductsListManager() {
  const { token } = useAdminAuth();
  const { flash, node } = useFlash();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [banner, setBanner] = useState('');
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (token) api.get<Category[]>('/admin/categories', token).then(setCategories).catch(() => {});
  }, [token]);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (categoryId) params.set('categoryId', categoryId);
    const qs = params.toString();
    api
      .get<Product[]>(`/admin/products${qs ? `?${qs}` : ''}`, token)
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, q, categoryId]);

  async function move(i: number, dir: -1 | 1) {
    if (!token) return;
    const ids = moved(items, i, dir);
    if (!ids) return;
    const next = ids.map((id) => items.find((p) => p.id === id)!);
    setItems(next);
    try {
      await api.post('/admin/products/reorder', { ids }, token);
    } catch (err) {
      setBanner(errorInfo(err, 'Could not reorder products.').message);
      load();
    }
  }

  async function remove(p: Product) {
    if (!token) return;
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${p.id}`, token);
      flash('Product deleted.');
      load();
    } catch (err) {
      setBanner(errorInfo(err, 'Could not delete this product.').message);
    }
  }

  return (
    <div className="grid gap-4">
      {node}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} className={`${aInput} max-w-xs`} />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${aInput} w-auto`}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Link href="/admin/products/new" className={`${aBtn.accent} no-underline inline-flex items-center`}>
          + New product
        </Link>
      </div>

      {banner && <AdminError message={banner} onRetry={() => setBanner('')} />}

      {error ? (
        <AdminError message="Could not load products." onRetry={load} />
      ) : loading ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <AdminEmpty>No products yet. Products you add here appear in the shop once published.</AdminEmpty>
      ) : (
        <div className="bg-cream border border-rule rounded-2xl overflow-hidden divide-y divide-rule">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex flex-col gap-0.5 flex-none">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-xs disabled:opacity-30" aria-label="Move up">
                  ▲
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="text-xs disabled:opacity-30" aria-label="Move down">
                  ▼
                </button>
              </div>
              <Link href={`/admin/products/${p.id}`} className="flex-1 min-w-0 flex flex-col gap-0.5 no-underline text-ink hover:text-clay">
                <span className="font-semibold truncate">{p.name}</span>
                <span className="text-sm text-muted truncate">
                  {p.category?.name || 'No category'}
                  {p.price != null ? ` · ${money(p.price)}` : ''}
                </span>
              </Link>
              <div className="flex items-center gap-2 flex-none">
                {p.featured && <Pill tone="warn">Featured</Pill>}
                <Pill tone={p.published ? 'good' : 'off'}>{p.published ? 'Published' : 'Draft'}</Pill>
                <Link href={`/admin/products/${p.id}`} className={`${aBtn.ghost} no-underline`}>
                  Edit
                </Link>
                <button type="button" onClick={() => remove(p)} className={aBtn.danger}>
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
