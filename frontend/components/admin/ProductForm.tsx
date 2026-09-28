'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api, mediaUrl, uploadFile } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import { AVAILABILITIES, type Availability, type Category, type Product, type ProductImage } from '@/lib/types';
import { AdminError, ListSkeleton, Switch, aBtn, aInput, useFlash } from '@/components/admin/ui';

const textarea = 'px-3 py-2.5 rounded-[10px] border-[1.5px] border-edge bg-field text-ink text-[15px] focus:outline-none focus:border-clay';
const label = 'text-[13px] font-semibold';

function ImageRow({ image, onChange, onRemove, token }: { image: ProductImage; onChange: (v: ProductImage) => void; onRemove: () => void; token: string }) {
  const [busy, setBusy] = useState(false);
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await uploadFile(file, token);
      onChange({ ...image, url });
    } catch {
      // surfaced via the row staying on "Upload" — the parent shows a general save error on submit
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-3 bg-paper border border-rule rounded-xl p-3">
      {image.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(image.url) || undefined} alt="" className="w-16 h-16 object-cover rounded-lg border border-edge flex-none" />
      ) : (
        <span className="w-16 h-16 rounded-lg border border-dashed border-edge flex items-center justify-center text-[11px] text-muted flex-none">None</span>
      )}
      <label className="h-9 px-3 flex items-center border border-dashed border-edge rounded-lg text-xs cursor-pointer bg-cream flex-none">
        {busy ? 'Uploading…' : image.url ? 'Replace' : 'Upload'}
        <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={busy} />
      </label>
      <input
        placeholder="Alt text"
        value={image.alt || ''}
        onChange={(e) => onChange({ ...image, alt: e.target.value })}
        className="min-h-9 px-2.5 rounded-lg border border-rule flex-1 min-w-[120px] text-sm bg-cream"
      />
      <input
        placeholder="Label (optional)"
        value={image.label || ''}
        onChange={(e) => onChange({ ...image, label: e.target.value })}
        className="min-h-9 px-2.5 rounded-lg border border-rule flex-1 min-w-[120px] text-sm bg-cream"
      />
      <button type="button" onClick={onRemove} className="text-xs text-err underline bg-transparent border-0 cursor-pointer flex-none">
        Remove
      </button>
    </div>
  );
}

export function ProductForm({ productId }: { productId?: string }) {
  const { token } = useAdminAuth();
  const router = useRouter();
  const { flash, node } = useFlash();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState<Availability | ''>('');
  const [materials, setMaterials] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<Category[]>('/admin/categories', token).then(setCategories).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !productId) return;
    setLoading(true);
    setLoadError(false);
    api
      .get<Product>(`/admin/products/${productId}`, token)
      .then((p) => {
        setName(p.name);
        setCategoryId(p.categoryId || '');
        setDescription(p.description || '');
        setPrice(p.price != null ? String(p.price) : '');
        setAvailability(p.availability || '');
        setMaterials(p.materials || '');
        setImages(p.images || []);
        setFeatured(p.featured);
        setPublished(p.published);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [token, productId]);

  function addImage() {
    if (images.length >= 8) return;
    setImages((imgs) => [...imgs, { url: '', alt: '', label: '' }]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setFieldErrors({});
    setSaving(true);
    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim() || null,
      price: price.trim() === '' ? null : Number(price),
      availability: availability || null,
      materials: materials.trim() || null,
      images: images.filter((i) => i.url),
      featured,
      published,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/products/${productId}`, payload, token);
      } else {
        await api.post('/admin/products', payload, token);
      }
      flash(isEdit ? 'Product saved.' : 'Product created.');
      setTimeout(() => router.push('/admin/products'), 500);
    } catch (err) {
      const info = errorInfo(err, 'Could not save this product.');
      setError(info.message);
      setFieldErrors(info.fields);
      setSaving(false);
    }
  }

  async function remove() {
    if (!token || !productId) return;
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${productId}`, token);
      router.push('/admin/products');
    } catch (err) {
      setError(errorInfo(err, 'Could not delete this product.').message);
    }
  }

  if (loadError) return <AdminError message="Could not load this product." />;
  if (loading) return <ListSkeleton rows={6} />;

  return (
    <form onSubmit={onSubmit} className="grid gap-5 max-w-2xl">
      {node}
      {error && <AdminError message={error} />}

      <label className="grid gap-1.5">
        <span className={label}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={aInput} required />
        {fieldErrors.name && <span className="text-[13px] text-err">{fieldErrors.name}</span>}
      </label>

      <label className="grid gap-1.5">
        <span className={label}>Category</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={aInput} required>
          <option value="">— Choose a category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {!c.published ? ' (draft)' : ''}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId && <span className="text-[13px] text-err">{fieldErrors.categoryId}</span>}
      </label>

      <label className="grid gap-1.5">
        <span className={label}>Description</span>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={textarea} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-1.5">
          <span className={label}>Price <span className="font-normal text-muted">(optional)</span></span>
          <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={aInput} placeholder="Leave blank to hide" />
          {fieldErrors.price && <span className="text-[13px] text-err">{fieldErrors.price}</span>}
        </label>
        <label className="grid gap-1.5">
          <span className={label}>Availability <span className="font-normal text-muted">(optional)</span></span>
          <select value={availability} onChange={(e) => setAvailability(e.target.value as Availability | '')} className={aInput}>
            <option value="">— Not shown —</option>
            {AVAILABILITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={label}>Materials <span className="font-normal text-muted">(optional)</span></span>
        <input value={materials} onChange={(e) => setMaterials(e.target.value)} className={aInput} placeholder="Leave blank to hide" />
      </label>

      <div className="grid gap-2.5">
        <span className={label}>Images <span className="font-normal text-muted">(up to 8)</span></span>
        {images.map((img, i) => (
          <ImageRow
            key={i}
            image={img}
            token={token!}
            onChange={(v) => setImages((imgs) => imgs.map((x, j) => (j === i ? v : x)))}
            onRemove={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
          />
        ))}
        {images.length < 8 && (
          <button type="button" onClick={addImage} className={`${aBtn.ghost} self-start`}>
            + Add image
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <Switch checked={featured} onChange={() => setFeatured((v) => !v)} onLabel="Featured" offLabel="Not featured" />
        <Switch checked={published} onChange={() => setPublished((v) => !v)} onLabel="Published" offLabel="Draft" />
      </div>

      <div className="flex gap-2 items-center">
        <button type="submit" disabled={saving} className={aBtn.primary}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <Link href="/admin/products" className={`${aBtn.ghost} no-underline`}>
          Cancel
        </Link>
        {isEdit && (
          <button type="button" onClick={remove} className={`${aBtn.danger} ml-auto`}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
