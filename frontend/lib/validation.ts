/**
 * Mirrors backend/src/common/form-rules.ts — the design comp's `vContact()` /
 * `vReg()` verbatim. Frontend validation is instant feedback only; the API
 * re-validates everything.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface InquiryValues {
  name: string;
  email: string;
  type: string;
  ref: string;
  message: string;
}

export interface RegistrationValues {
  name: string;
  email: string;
  workshop: string;
  attendees: string;
  message: string;
}

export function validateInquiry(c: InquiryValues) {
  const e: Record<string, string> = {};
  if (!c.name.trim()) e.name = 'Please enter your name.';
  if (!c.email.trim()) e.email = 'Please enter your email so the studio can reply.';
  else if (!EMAIL_RE.test(c.email.trim())) e.email = "That email doesn't look quite right — check for a typo.";
  if (!c.type) e.type = 'Choose what your inquiry is about.';
  if (c.message.trim().length < 10) e.message = 'Add a short message (at least 10 characters).';
  return e;
}

export function validateRegistration(r: RegistrationValues) {
  const e: Record<string, string> = {};
  if (!r.name.trim()) e.name = 'Please enter your name.';
  if (!r.email.trim()) e.email = 'Please enter your email so the studio can confirm.';
  else if (!EMAIL_RE.test(r.email.trim())) e.email = "That email doesn't look quite right — check for a typo.";
  if (!r.workshop) e.workshop = 'Choose a workshop.';
  return e;
}

export const INQUIRY_TYPE_OPTIONS = [
  { value: 'product', label: 'A product' },
  { value: 'workshop', label: 'A workshop' },
  { value: 'general', label: 'Something else' },
];

/** "Please check 2 fields below." */
export const fieldsLabel = (n: number) => `${n} ${n === 1 ? 'field' : 'fields'}`;
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'friend';
