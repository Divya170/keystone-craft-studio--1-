'use client';

import { useState } from 'react';
import type { FaqItem } from '@/lib/types';

/** The comp's dashed-rule accordion; several items can be open at once. */
export function FaqAccordion({ items, heading = 'h3' }: { items: FaqItem[]; heading?: 'h2' | 'h3' }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const H = heading;
  return (
    <div className="border-t-[1.5px] border-dashed border-rule">
      {items.map((f) => {
        const isOpen = !!open[f.id];
        return (
          <div key={f.id} className="border-b-[1.5px] border-dashed border-rule">
            <H>
              <button
                type="button"
                id={`fq-${f.id}`}
                aria-expanded={isOpen}
                aria-controls={`fa-${f.id}`}
                onClick={() => setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))}
                className="w-full flex justify-between items-center gap-5 min-h-[68px] py-[18px] bg-transparent border-0 text-left cursor-pointer font-medium text-lg leading-[1.35] text-ink"
              >
                <span>{f.question}</span>
                <span
                  aria-hidden
                  className="flex-none w-9 h-9 rounded-full border-[1.5px] border-ink grid place-items-center text-xl leading-none transition-[transform,background,color] duration-[250ms]"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'none', background: isOpen ? '#2B211B' : 'transparent', color: isOpen ? '#F3ECE1' : '#2B211B' }}
                >
                  +
                </span>
              </button>
            </H>
            <div id={`fa-${f.id}`} role="region" aria-labelledby={`fq-${f.id}`} className="collapse-panel" data-open={isOpen}>
              <div className="overflow-hidden">
                <p className={`pr-14 pb-[22px] text-base leading-[1.65] ${f.pending ? 'text-muted italic' : 'text-body'}`}>{f.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
