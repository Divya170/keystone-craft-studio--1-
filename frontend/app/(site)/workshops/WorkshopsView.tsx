'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { RegistrationReceipt, Workshop } from '@/lib/types';
import { fieldsLabel, firstName, validateRegistration, type RegistrationValues } from '@/lib/validation';
import { btn, eyebrow, formatWhen, money, pad2 } from '@/lib/ui';
import { paragraphs } from '@/lib/studio';
import { Photo } from '@/components/Photo';
import { StatusPill } from '@/components/shop/ProductCard';
import { useStudioForm } from '@/components/forms/useStudioForm';
import { Alert, SelectField, TextArea, TextField } from '@/components/forms/Field';
import { SuccessCard } from '@/components/SuccessCard';

const RADII = ['160px 28px 28px 28px', '28px 160px 28px 28px'];

export function WorkshopsView({ workshops, initialSlug, studioLocation }: { workshops: Workshop[]; initialSlug?: string; studioLocation: string }) {
  const initial = workshops.find((w) => w.slug === initialSlug) || workshops.find((w) => w.canRegister) || workshops[0];
  const [selId, setSelId] = useState(initial?.id || '');
  const f = useStudioForm<RegistrationValues, RegistrationReceipt>(
    { name: '', email: '', workshop: initial?.canRegister ? initial.id : '', attendees: '1', message: '' },
    validateRegistration,
    'r-',
  );
  const sel = workshops.find((w) => w.id === selId) || initial;

  // Deep link (?workshop=…#register) — scroll once the page has laid out.
  useEffect(() => {
    if (initialSlug && window.location.hash === '#register') {
      setTimeout(() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }, [initialSlug]);

  const pick = (w: Workshop) => {
    setSelId(w.id);
    if (f.status === 'sent') f.reset({ name: f.values.name, email: f.values.email });
    f.set('workshop', w.canRegister ? w.id : '');
    setTimeout(() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  if (!workshops.length) {
    return (
      <section className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(72px,9vw,120px)]">
        <div className="max-w-[680px] p-[clamp(32px,5vw,56px)] rounded-[28px] bg-sand flex flex-col gap-4 items-start">
          <h2 className="font-display text-[clamp(30px,3.4vw,44px)] leading-[1.05]">Workshop dates are being planned.</h2>
          <p className="text-[17px] leading-relaxed text-body">
            The studio is putting together its next workshops. Send a note to hear first — or tell the studio what you’d love to learn.
          </p>
          <Link href="/contact?type=workshop#contact-form" className={btn.primary}>
            Ask About Workshops <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    );
  }

  const errN = Object.keys(f.errors).length;
  const sending = f.status === 'sending';
  const regW = workshops.find((w) => w.id === f.values.workshop);
  const detailRows = sel
    ? ([
        ['Status', sel.status],
        sel.startsAt ? ['When', formatWhen(sel.startsAt)] : null,
        sel.duration ? ['Duration', sel.duration] : null,
        sel.price != null ? ['Price', money(sel.price)] : null,
        sel.capacity != null ? ['Spots', sel.full ? 'Full' : `${sel.spotsLeft} of ${sel.capacity} left`] : null,
        sel.materials ? ['Materials', sel.materials] : null,
        ['Location', sel.location || studioLocation],
      ].filter(Boolean) as [string, string][])
    : [];

  return (
    <>
      <section aria-labelledby="wsl-title" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-[clamp(72px,9vw,120px)]">
        <h2 id="wsl-title" className="font-display text-[clamp(32px,3.6vw,52px)] leading-[1.04] tracking-[-0.02em] mb-[clamp(32px,4vw,56px)]">
          Workshops at the studio
        </h2>
        <ol className="list-none m-0 p-0 flex flex-col gap-[clamp(56px,7vw,96px)]">
          {workshops.map((w, i) => (
            <li key={w.id} className="grid items-center gap-[clamp(28px,4vw,64px)] grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))]">
              <div className={`group relative aspect-[5/4] overflow-hidden ${i % 2 ? 'sm:order-2' : ''}`} style={{ borderRadius: RADII[i % 2] }}>
                <Photo src={w.image} alt={w.imageAlt || w.title} toneKey={w.id} note="workshop photo to come" className="transition-transform duration-[6000ms] ease-out group-hover:scale-[1.06]" />
              </div>
              <div className="order-1 flex flex-col gap-[18px] max-w-[520px]">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <span className="font-mono font-medium text-sm text-note">{pad2(i + 1)}</span>
                  <StatusPill status={w.full ? 'Full' : w.status} />
                  {w.startsAt && <span className="font-medium text-sm text-muted">{formatWhen(w.startsAt)}</span>}
                </div>
                <h3 className="font-display text-[clamp(30px,3vw,42px)] leading-[1.06] tracking-[-0.015em]">{w.title}</h3>
                {w.summary && <p className="text-[17px] leading-relaxed text-muted">{w.summary}</p>}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  <button
                    type="button"
                    onClick={() => pick(w)}
                    className="inline-flex items-center gap-3 min-h-[52px] px-[26px] rounded-full border-0 bg-clay text-cream cursor-pointer font-semibold transition-[background,gap] hover:bg-clay-hover hover:gap-4"
                  >
                    {w.canRegister ? 'Register' : 'View details'} <span aria-hidden>→</span>
                  </button>
                  <Link href={`/contact?type=workshop&ref=${encodeURIComponent(w.title)}#contact-form`} className="inline-flex items-center min-h-11 font-semibold text-ink no-underline border-b-[1.5px] border-clay hover:text-clay">
                    Ask About Workshop
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="register" aria-labelledby="wsd-title" className="scroll-mt-20 bg-sand py-[clamp(72px,9vw,120px)]">
        <div className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] grid items-start gap-[clamp(40px,6vw,88px)] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          {sel && (
            <div className="flex flex-col gap-[22px]">
              <p className={eyebrow}>Workshop detail</p>
              <h2 id="wsd-title" className="font-display text-[clamp(34px,4vw,56px)] leading-[1.03] tracking-[-0.02em]">
                {sel.title}
              </h2>
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
                <Photo src={sel.image} alt={sel.imageAlt || sel.title} toneKey={sel.id} />
              </div>
              {sel.details && (
                <>
                  <h3 className="mt-2 font-semibold text-[19px] leading-[1.3]">What to expect</h3>
                  {paragraphs(sel.details).map((p, i) => (
                    <p key={i} className="text-[17px] leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </>
              )}
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-7 gap-y-3.5 pt-[18px] border-t-[1.5px] border-dashed border-edge text-base leading-[1.4]">
                {detailRows.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold">{k}</dt>
                    <dd className="m-0 whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="bg-cream rounded-[28px] p-[clamp(24px,3.5vw,48px)]">
            {f.status === 'sent' && f.result ? (
              <SuccessCard
                title="Request received."
                reference={f.result.reference}
                actions={[
                  { label: 'Register for another', onClick: () => f.reset({ name: f.result!.name, email: f.result!.email, workshop: '' }) },
                  { label: 'Explore the Shop', href: '/shop', variant: 'link' },
                ]}
              >
                <p>
                  Thanks, {firstName(f.result.name)} — your registration for <strong>{f.result.workshopTitle}</strong> ({f.result.attendees}{' '}
                  {f.result.attendees === 1 ? 'person' : 'people'}) is with the studio.
                </p>
                <ol className="m-0 pl-5 flex flex-col gap-2 text-base leading-[1.55]">
                  <li>The studio reviews your request.</li>
                  <li>
                    You&apos;ll hear back at <strong>{f.result.email}</strong> with dates and details.
                  </li>
                </ol>
              </SuccessCard>
            ) : (
              <form
                onSubmit={(e) => f.submit(e, (v) => api.post<RegistrationReceipt>('/registrations', v))}
                noValidate
                aria-labelledby="reg-title"
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <h3 id="reg-title" className="font-display text-[32px] leading-[1.08]">
                    Register
                  </h3>
                  <p className="text-[15px] leading-normal text-muted">
                    Four quick fields. <span aria-hidden>*</span> Required.
                  </p>
                </div>
                {errN > 0 && <Alert>Please check {fieldsLabel(errN)} below.</Alert>}
                {f.status === 'error' && <Alert>{f.failMsg || "Your registration couldn't be sent. Please try again in a moment."}</Alert>}
                <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]">
                  <TextField id="r-name" label="Name" required autoComplete="name" value={f.values.name} onChange={(x) => f.set('name', x)} error={f.errors.name} />
                  <TextField id="r-email" label="Email" required type="email" inputMode="email" autoComplete="email" value={f.values.email} onChange={(x) => f.set('email', x)} error={f.errors.email} />
                </div>
                <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]">
                  <SelectField
                    id="r-workshop"
                    label="Workshop"
                    required
                    placeholder="Choose a workshop…"
                    value={f.values.workshop}
                    onChange={(x) => {
                      f.set('workshop', x);
                      if (x) setSelId(x);
                    }}
                    options={workshops
                      .filter((w) => w.canRegister)
                      .map((w) => ({ value: w.id, label: w.spotsLeft != null ? `${w.title} (${w.spotsLeft} left)` : w.title }))}
                    error={f.errors.workshop}
                  />
                  <SelectField
                    id="r-attendees"
                    label="Attendees"
                    value={f.values.attendees}
                    onChange={(x) => f.set('attendees', x)}
                    options={[1, 2, 3, 4]
                      .filter((n) => !regW || regW.spotsLeft == null || n <= regW.spotsLeft)
                      .map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'person' : 'people'}` }))}
                    error={f.errors.attendees}
                  />
                </div>
                {sel && !sel.canRegister && (
                  <p className="text-[15px] text-muted">
                    {sel.full ? 'This workshop is full.' : 'Registration for this workshop is closed.'}{' '}
                    <Link href={`/contact?type=workshop&ref=${encodeURIComponent(sel.title)}#contact-form`}>Ask to hear about the next one</Link>.
                  </p>
                )}
                <TextArea id="r-message" label="Message" optional rows={3} value={f.values.message} onChange={(x) => f.set('message', x)} />
                <button
                  type="submit"
                  disabled={sending}
                  className="min-h-14 rounded-full border-0 bg-clay text-cream cursor-pointer font-semibold text-base transition-colors hover:bg-clay-hover disabled:opacity-70 disabled:cursor-wait"
                >
                  {sending ? 'Sending…' : 'Send Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
