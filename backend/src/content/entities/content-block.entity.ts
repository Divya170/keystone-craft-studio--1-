import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ContentType {
  HERO_SLIDE = 'hero_slide',
  SITE_IMAGE = 'site_image',
  GALLERY_IMAGE = 'gallery_image',
  ABOUT_IMAGE = 'about_image',
  FAQ_ITEM = 'faq_item',
  TEAM_MEMBER = 'team_member',
}

/**
 * Generic, polymorphic content block covering every simple CMS collection
 * with one entity. `fields` holds the type-specific data as JSON:
 *   hero_slide     { image, alt }                       Home hero crossfade
 *   site_image     { slot, image, alt }                 fixed photo slots (see SITE_IMAGE_SLOTS)
 *   gallery_image  { image, alt, caption }              Home "Inside the studio" drift
 *   about_image    { image, alt, caption }              About "Studio in pictures"
 *   faq_item       { category, question, answer, showOnHome }
 *   team_member    { name, role, photo, bio }           About team (hidden when none)
 * Products, categories, workshops, registrations and inquiries get
 * dedicated modules (filtered/searched lists, relations, capacity rules).
 */
@Entity('content_blocks')
export class ContentBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: ContentType;

  @Column({ type: 'simple-json' })
  fields: Record<string, any>;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/** Fixed photo slots used across pages (admin can replace, not add/remove). */
export const SITE_IMAGE_SLOTS = [
  'home-hero-inset',
  'home-studio-main',
  'home-studio-inset',
  'workshops-hero',
  'about-story',
  'about-location',
  'contact-moodboard',
] as const;
