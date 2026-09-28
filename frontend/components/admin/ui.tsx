'use client';

import { useState } from 'react';
import { ApiError, mediaUrl, uploadFile } from '@/lib/api';
import type { Tone } from '@/lib/types';
import { tone as tones } from '@/lib/ui';

export const aInput = 'w-full h-11 px-3 rounded-[10px] border-[1.5px] border-edge text-[15px] bg-field text-ink focus:outline-none focus:border-clay';
export const aBtn = {
  primary: 'h-11 px-[18px] rounded-full bg-ink text-cream border-0 font-semibold cursor-pointer hover:bg-clay disabled:opacity-60',
  accent: 'h-11 px-[18px] rounded-full bg-clay text-cream border-0 font-semibold cursor-pointer hover:bg-clay-hover disabled:opacity-60',
  ghost: 'h-11 px-3.5 rounded-full border-[1.5px] border-edge bg-cream text-ink font-semibold cursor-pointer hover:border-ink disabled:opacity-40',
  danger: 'h-11 px-3.5 rounded-full border-[1.5px] border-err bg-cream text-err font-semibold cursor-pointer hover:bg-err-bg',
  icon: 'w-11 h-11 rounded-full border-[1.5px] border-edge bg-cream cursor-pointer disabled:opacity-30 disabled:cursor-default',
};

/** Published/Draft switch (comp: role="switch"). */
export function Switch({ checked, onChange, onLabel = 'Published', offLabel = 'Draft', disabled }: { checked: boolean; onChange: () => void; onLabel?: string; offLabel?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className="flex items-center gap-2.5 min-h-11 bg-transparent border-0 cursor-pointer text-sm text-ink disabled:opacity-50"
    >
      <span className="relative w-11 h-6 rounded-full transition-colors" style={{ background: checked ? '#4E7A3A' : '#A8998A' }}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-[left]" style={{ left: checked ? 22 : 2 }} />
      </span>
      {checked ? onLabel : offLabel}
    </button>
  );
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return <div className="bg-cream border border-dashed border-edge px-6 py-8 text-muted leading-relaxed">{children}</div>;
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="px-4 py-3.5 bg-err-bg border border-err text-err-text text-[15px] flex flex-wrap gap-3 items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="h-9 px-3 bg-cream border border-err-text text-err-text font-semibold cursor-pointer">
          Retry
        </button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-cream border border-rule animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center px-4 py-4 border-b border-linen">
          <span className="h-4 w-1/3 bg-line" />
          <span className="h-4 w-1/5 bg-line ml-auto" />
        </div>
      ))}
    </div>
  );
}

/** Image picker that uploads to /admin/uploads and returns the stored path. */
export function ImageField({ label, value, onChange, token }: { label: string; value: string | null; onChange: (v: string | null) => void; token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      onChange((await uploadFile(file, token)).url);
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold">{label}</span>
      <div className="flex items-center gap-3 flex-wrap">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(value) || undefined} alt="" className="w-20 h-16 object-cover border border-edge" />
        ) : (
          <span className="w-20 h-16 border border-dashed border-edge bg-cream flex items-center justify-center text-[11px] text-muted">None</span>
        )}
        <label className="h-10 px-3 flex items-center border border-dashed border-edge text-sm cursor-pointer bg-cream">
          {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={busy} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-sm text-err underline bg-transparent border-0 cursor-pointer">
            Remove
          </button>
        )}
      </div>
      {err && <span className="text-[13px] text-err">{err}</span>}
    </div>
  );
}

/** Swap two items in an id list — used by the ↑/↓ reorder buttons. */
export function moved<T extends { id: string }>(list: T[], i: number, dir: -1 | 1) {
  const n = list.slice();
  const j = i + dir;
  if (j < 0 || j >= n.length) return null;
  [n[i], n[j]] = [n[j], n[i]];
  return n.map((x) => x.id);
}

export function useFlash() {
  const [msg, setMsg] = useState('');
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg((cur) => (cur === m ? '' : cur)), 3400);
  };
  const node = (
    <div role="status" aria-live="polite" className="fixed left-1/2 bottom-8 -translate-x-1/2 z-[60] pointer-events-none">
      {msg && <div className="bg-ink text-white px-5 py-3.5 text-[15px] shadow-[0_12px_30px_rgba(7,18,31,.3)] animate-rise">{msg}</div>}
    </div>
  );
  return { flash, node };
}

export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = tones[tone];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: t.bg, color: t.color }}>
      <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
      {children}
    </span>
  );
}

