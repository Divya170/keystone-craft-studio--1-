export const btn = {
  primary:
    'inline-flex items-center justify-center gap-3 min-h-[54px] px-7 rounded-full bg-clay text-cream font-semibold text-base no-underline border-0 cursor-pointer transition-[background,gap,transform] duration-200 hover:bg-clay-hover hover:text-cream hover:gap-4 disabled:opacity-70 disabled:cursor-wait',
  outline:
    'inline-flex items-center justify-center gap-3 min-h-[54px] px-7 rounded-full border-[1.5px] border-ink bg-transparent text-ink font-semibold text-base no-underline cursor-pointer transition-colors duration-200 hover:bg-ink hover:text-paper',
  link: 'inline-flex items-center gap-2.5 min-h-11 font-semibold text-base text-ink no-underline border-b-[1.5px] border-clay transition-[gap,color] duration-200 hover:gap-4 hover:text-clay',
};

export const field =
  'w-full min-h-[52px] px-4 rounded-[14px] border-[1.5px] bg-field text-base text-ink focus:outline-none focus:border-clay';

export const eyebrow = 'font-bold text-[12.5px] leading-[1.2] tracking-[0.18em] uppercase text-clay';

export const tone = {
  good: { bg: '#E3EBDA', color: '#2F4A22', dot: '#4E7A3A' },
  warn: { bg: '#F6E6CF', color: '#7A4A12', dot: '#C8801E' },
  off: { bg: '#ECE4D8', color: '#5A4A3F', dot: '#A8998A' },
} as const;

const TONES = ['clay', 'sage', 'ochre', 'oat'] as const;
/** Deterministic placeholder stripe for items without a photo yet. */
export function toneFor(key: string | number) {
  const s = String(key);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `tone-${TONES[h % TONES.length]}`;
}

export const money = (n: number | null | undefined) =>
  n == null ? null : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 });

export function formatWhen(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? iso + 'T00:00' : iso);
  if (isNaN(d.getTime())) return iso;
  return iso.length === 10
    ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
