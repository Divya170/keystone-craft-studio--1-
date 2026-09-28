import type { Settings } from './types';

export const cityOf = (s: Settings | null) => s?.city || 'Harrisburg, Pennsylvania';
export const nameOf = (s: Settings | null) => s?.businessName || 'Keystone Craft Studio';

/** Contact rows — only those the studio has supplied (comp: "render only when supplied"). */
export function contactRows(s: Settings | null) {
  return [
    { k: 'Hours', v: s?.hours },
    { k: 'Email', v: s?.email, href: s?.email ? `mailto:${s.email}` : undefined },
    { k: 'Phone', v: s?.phone, href: s?.phone ? `tel:${s.phone.replace(/[^0-9+]/g, '')}` : undefined },
  ].filter((r) => r.v) as { k: string; v: string; href?: string }[];
}

export const paragraphs = (text: string | null | undefined) => (text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
