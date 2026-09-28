'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { api } from '@/lib/api';
import { errorInfo } from '@/lib/admin-errors';
import type { Settings, SocialLink } from '@/lib/types';
import { AdminError, ImageField, ListSkeleton, aBtn, aInput, useFlash } from '@/components/admin/ui';

const textarea = 'px-3 py-2.5 rounded-[10px] border-[1.5px] border-edge bg-field text-ink text-[15px] focus:outline-none focus:border-clay';
const label = 'text-[13px] font-semibold';

function withProtocol(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function SettingsManager() {
  const { token } = useAdminAuth();
  const { flash, node } = useFlash();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studioSummary, setStudioSummary] = useState('');
  const [story, setStory] = useState('');
  const [philosophyQuote, setPhilosophyQuote] = useState('');
  const [philosophyText, setPhilosophyText] = useState('');
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroLayout, setHeroLayout] = useState<'split' | 'layered'>('split');

  const load = () => {
    if (!token) return;
    setLoading(true);
    setLoadError(false);
    api
      .get<Settings>('/admin/settings', token)
      .then((s) => {
        setBusinessName(s.businessName || '');
        setCity(s.city || '');
        setAddress(s.address || '');
        setHours(s.hours || '');
        setEmail(s.email || '');
        setPhone(s.phone || '');
        setStudioSummary(s.studioSummary || '');
        setStory(s.story || '');
        setPhilosophyQuote(s.philosophyQuote || '');
        setPhilosophyText(s.philosophyText || '');
        setMapImage(s.mapImage);
        setMapUrl(s.mapUrl || '');
        setSocialLinks(s.socialLinks || []);
        setHeroLayout(s.heroLayout);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function addLink() {
    setSocialLinks((l) => [...l, { label: '', url: '' }]);
  }
  function removeLink(i: number) {
    setSocialLinks((l) => l.filter((_, j) => j !== i));
  }
  function updateLink(i: number, patch: Partial<SocialLink>) {
    setSocialLinks((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    setFieldErrors({});
    setSaving(true);
    const payload = {
      businessName: businessName.trim() || null,
      city: city.trim() || null,
      address: address.trim() || null,
      hours: hours.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      studioSummary: studioSummary.trim() || null,
      story: story.trim() || null,
      philosophyQuote: philosophyQuote.trim() || null,
      philosophyText: philosophyText.trim() || null,
      mapImage,
      mapUrl: mapUrl.trim() || null,
      socialLinks: socialLinks
        .filter((l) => l.label.trim() && l.url.trim())
        .map((l) => ({ label: l.label.trim(), url: withProtocol(l.url) })),
      heroLayout,
    };
    try {
      await api.put('/admin/settings', payload, token);
      flash('Settings saved.');
      load();
    } catch (err) {
      const info = errorInfo(err, 'Could not save settings.');
      setError(info.message);
      setFieldErrors(info.fields);
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <AdminError message="Could not load settings." onRetry={load} />;
  if (loading) return <ListSkeleton rows={6} />;

  return (
    <div className="grid gap-8 max-w-2xl">
      <form onSubmit={onSubmit} className="grid gap-5">
        {node}
        {error && <AdminError message={error} />}
        <p className="text-sm text-muted m-0">Blank fields are hidden on the website rather than shown empty.</p>

        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className={label}>Business name</span>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={aInput} />
          </label>
          <label className="grid gap-1.5">
            <span className={label}>City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={aInput} />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={label}>Address</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={aInput} />
        </label>

        <label className="grid gap-1.5">
          <span className={label}>Hours</span>
          <textarea rows={3} value={hours} onChange={(e) => setHours(e.target.value)} className={textarea} placeholder={'e.g.\nTue–Fri 10am–5pm\nSat 10am–3pm'} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className={label}>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={aInput} />
            {fieldErrors.email && <span className="text-[13px] text-err">{fieldErrors.email}</span>}
          </label>
          <label className="grid gap-1.5">
            <span className={label}>Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={aInput} />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={label}>Home studio summary</span>
          <textarea rows={3} value={studioSummary} onChange={(e) => setStudioSummary(e.target.value)} className={textarea} />
        </label>

        <label className="grid gap-1.5">
          <span className={label}>Studio story</span>
          <textarea rows={5} value={story} onChange={(e) => setStory(e.target.value)} className={textarea} />
        </label>

        <label className="grid gap-1.5">
          <span className={label}>Craft philosophy — quote</span>
          <input value={philosophyQuote} onChange={(e) => setPhilosophyQuote(e.target.value)} className={aInput} />
        </label>
        <label className="grid gap-1.5">
          <span className={label}>Craft philosophy — text</span>
          <textarea rows={4} value={philosophyText} onChange={(e) => setPhilosophyText(e.target.value)} className={textarea} />
        </label>

        <ImageField label="Map image" value={mapImage} onChange={setMapImage} token={token!} />
        <label className="grid gap-1.5">
          <span className={label}>Map link URL</span>
          <input value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} className={aInput} placeholder="https://maps.google.com/…" />
        </label>

        <div className="grid gap-2.5">
          <span className={label}>Social links</span>
          {socialLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input placeholder="Label (e.g. Instagram)" value={l.label} onChange={(e) => updateLink(i, { label: e.target.value })} className={`${aInput} flex-1`} />
              <input placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, { url: e.target.value })} className={`${aInput} flex-1`} />
              <button type="button" onClick={() => removeLink(i)} className="text-sm text-err underline bg-transparent border-0 cursor-pointer flex-none">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addLink} className={`${aBtn.ghost} self-start`}>
            + Add link
          </button>
        </div>

        <label className="grid gap-1.5">
          <span className={label}>Home hero layout</span>
          <select value={heroLayout} onChange={(e) => setHeroLayout(e.target.value as 'split' | 'layered')} className={aInput}>
            <option value="split">Split</option>
            <option value="layered">Layered</option>
          </select>
        </label>

        <button type="submit" disabled={saving} className={`${aBtn.primary} justify-self-start`}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const { token } = useAdminAuth();
  const { flash, node } = useFlash();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('New passwords do not match.');
    setSaving(true);
    try {
      await api.post('/admin/auth/change-password', { currentPassword, newPassword }, token);
      flash('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(errorInfo(err, 'Could not change your password.').message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 pt-6 border-t border-rule">
      {node}
      <h2 className="text-lg font-semibold m-0">Change password</h2>
      {error && <AdminError message={error} />}
      <label className="grid gap-1.5">
        <span className={label}>Current password</span>
        <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={aInput} required />
      </label>
      <label className="grid gap-1.5">
        <span className={label}>New password</span>
        <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={aInput} required />
      </label>
      <label className="grid gap-1.5">
        <span className={label}>Confirm new password</span>
        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={aInput} required />
      </label>
      <button type="submit" disabled={saving} className={`${aBtn.primary} justify-self-start`}>
        {saving ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}
