'use client';

import { api } from '@/lib/api';
import type { InquiryReceipt } from '@/lib/types';
import { fieldsLabel, firstName, INQUIRY_TYPE_OPTIONS, validateInquiry, type InquiryValues } from '@/lib/validation';
import { useStudioForm } from './useStudioForm';
import { Alert, SelectField, TextArea, TextField } from './Field';
import { SuccessCard } from '../SuccessCard';

const BLANK: InquiryValues = { name: '', email: '', type: '', ref: '', message: '' };

/** "Send an inquiry" — Home + Contact. `prefill` comes from Ask About buttons. */
export function InquiryForm({ prefill }: { prefill?: Partial<InquiryValues> }) {
  const f = useStudioForm<InquiryValues, InquiryReceipt>({ ...BLANK, ...prefill }, validateInquiry, 'c-');
  const v = f.values;
  const errN = Object.keys(f.errors).length;

  if (f.status === 'sent' && f.result) {
    return (
      <SuccessCard
        title={`Thank you, ${firstName(f.result.name)}.`}
        reference={f.result.reference}
        actions={[
          { label: 'Send another message', onClick: () => f.reset({ type: '', ref: '' }) },
          { label: 'Explore the Shop', href: '/shop', variant: 'link' },
        ]}
      >
        <p>
          Your message is with the studio. You&apos;ll hear back at <strong>{f.result.email}</strong>.
        </p>
      </SuccessCard>
    );
  }

  const sending = f.status === 'sending';
  return (
    <form onSubmit={(e) => f.submit(e, (vals) => api.post<InquiryReceipt>('/inquiries', vals))} noValidate aria-labelledby="cf-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h3 id="cf-title" className="font-display text-[30px] leading-[1.1]">
          Send an inquiry
        </h3>
        <p className="text-[15px] leading-normal text-muted">
          <span aria-hidden>*</span> Required
        </p>
      </div>
      {errN > 0 && <Alert>Please check {fieldsLabel(errN)} below.</Alert>}
      {f.status === 'error' && <Alert>{f.failMsg || "Your message couldn't be sent. Please try again in a moment."}</Alert>}
      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        <TextField id="c-name" label="Name" required autoComplete="name" value={v.name} onChange={(x) => f.set('name', x)} error={f.errors.name} />
        <TextField id="c-email" label="Email" required type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(x) => f.set('email', x)} error={f.errors.email} />
      </div>
      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]">
        <SelectField id="c-type" label="Inquiry type" required placeholder="Choose one…" options={INQUIRY_TYPE_OPTIONS} value={v.type} onChange={(x) => f.set('type', x)} error={f.errors.type} />
        <TextField id="c-ref" label="Product or workshop" optional value={v.ref} onChange={(x) => f.set('ref', x)} />
      </div>
      <TextArea id="c-message" label="Message" required value={v.message} onChange={(x) => f.set('message', x)} error={f.errors.message} />
      <button
        type="submit"
        disabled={sending}
        className="min-h-14 rounded-full border-0 bg-clay text-cream font-semibold text-base cursor-pointer transition-colors hover:bg-clay-hover disabled:opacity-70 disabled:cursor-wait"
      >
        {sending ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  );
}
