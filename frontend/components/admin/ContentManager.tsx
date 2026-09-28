'use client';

import { useState } from 'react';
import { ContentTypeEditor, type FieldDef } from '@/components/admin/ContentTypeEditor';
import type { ContentType } from '@/lib/types';

const TABS: { type: ContentType; label: string }[] = [
  { type: 'hero_slide', label: 'Home hero' },
  { type: 'gallery_image', label: 'Gallery' },
  { type: 'about_image', label: 'About photos' },
  { type: 'team_member', label: 'Team' },
  { type: 'faq_item', label: 'FAQ' },
  { type: 'site_image', label: 'Fixed photos' },
];

const FIELD_DEFS: Record<ContentType, FieldDef[]> = {
  hero_slide: [
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text' },
  ],
  gallery_image: [
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text', optional: true },
  ],
  about_image: [
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text', optional: true },
  ],
  team_member: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'photo', label: 'Photo', type: 'image' },
    { key: 'bio', label: 'Bio', type: 'textarea', optional: true },
  ],
  faq_item: [
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'question', label: 'Question', type: 'text' },
    { key: 'answer', label: 'Answer', type: 'textarea', optional: true },
    { key: 'showOnHome', label: 'Show on Home', type: 'checkbox' },
  ],
  site_image: [
    { key: 'slot', label: 'Slot', type: 'readonly' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt text', type: 'text' },
  ],
};

const ITEM_LABEL: Record<ContentType, (f: Record<string, any>, i: number) => string> = {
  hero_slide: (f, i) => f.alt || `Slide ${i + 1}`,
  gallery_image: (f) => f.caption || f.alt || 'Gallery photo',
  about_image: (f) => f.caption || f.alt || 'About photo',
  team_member: (f) => f.name || 'Team member',
  faq_item: (f) => f.question || 'Question',
  site_image: (f) => f.slot,
};

const EMPTY: Record<ContentType, string> = {
  hero_slide: 'No hero slides yet.',
  gallery_image: 'No gallery photos yet.',
  about_image: 'No About photos yet.',
  team_member: 'No team members yet — the About page hides this section until someone is added.',
  faq_item: 'No FAQ items yet.',
  site_image: 'No fixed photo slots found.',
};

export function ContentManager() {
  const [tab, setTab] = useState<ContentType>('hero_slide');

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Content type">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            role="tab"
            aria-selected={tab === t.type}
            onClick={() => setTab(t.type)}
            className="min-h-10 px-4 rounded-full text-sm font-semibold cursor-pointer border-[1.5px]"
            style={tab === t.type ? { background: '#3E4A36', color: '#F3ECE1', borderColor: '#3E4A36' } : { background: 'transparent', color: '#4A3D34', borderColor: '#CDBDA8' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ContentTypeEditor
        key={tab}
        type={tab}
        title={TABS.find((t) => t.type === tab)!.label}
        fieldDefs={FIELD_DEFS[tab]}
        itemLabel={ITEM_LABEL[tab]}
        emptyMessage={EMPTY[tab]}
        allowCreate={tab !== 'site_image'}
        allowDelete={tab !== 'site_image'}
      />
    </div>
  );
}
