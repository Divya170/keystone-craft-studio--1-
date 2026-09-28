/**
 * Validation copied verbatim from the design comp's `vContact()` / `vReg()`.
 * Mirrored in frontend/lib/validation.ts.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const INQUIRY_TYPES = ['product', 'workshop', 'general'] as const;

const s = (v: any) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function validateInquiry(c: { name?: string; email?: string; type?: string; message?: string }) {
  const e: Record<string, string> = {};
  if (!s(c.name).trim()) e.name = 'Please enter your name.';
  if (!s(c.email).trim()) e.email = 'Please enter your email so the studio can reply.';
  else if (!EMAIL_RE.test(s(c.email).trim())) e.email = "That email doesn't look quite right — check for a typo.";
  if (!s(c.type)) e.type = 'Choose what your inquiry is about.';
  else if (!(INQUIRY_TYPES as readonly string[]).includes(s(c.type))) e.type = 'Choose what your inquiry is about.';
  if (s(c.message).trim().length < 10) e.message = 'Add a short message (at least 10 characters).';
  return e;
}

export function validateRegistration(r: { name?: string; email?: string; workshop?: string }) {
  const e: Record<string, string> = {};
  if (!s(r.name).trim()) e.name = 'Please enter your name.';
  if (!s(r.email).trim()) e.email = 'Please enter your email so the studio can confirm.';
  else if (!EMAIL_RE.test(s(r.email).trim())) e.email = "That email doesn't look quite right — check for a typo.";
  if (!s(r.workshop)) e.workshop = 'Choose a workshop.';
  return e;
}

export function newReference(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}
