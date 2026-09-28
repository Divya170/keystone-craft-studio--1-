import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export interface SocialLink {
  label: string;
  url: string;
}

/**
 * Singleton row (id always 1): studio identity, contact details, long-form
 * About copy and the comp's `data-props` flags. Everything the comp shows as
 * a bracketed placeholder ("[Street address]", "[Studio story…]") starts
 * null — the site hides it until the studio supplies it.
 */
@Entity('settings')
export class Settings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ nullable: true })
  businessName: string | null;

  /** "Harrisburg, Pennsylvania" */
  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  hours: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  phone: string | null;

  /** Home "The studio" teaser — two or three sentences. */
  @Column({ type: 'text', nullable: true })
  studioSummary: string | null;

  /** About "How it started" — blank line separates paragraphs. */
  @Column({ type: 'text', nullable: true })
  story: string | null;

  @Column({ type: 'text', nullable: true })
  philosophyQuote: string | null;

  @Column({ type: 'text', nullable: true })
  philosophyText: string | null;

  /** Contact-page static map image (the comp: "static image, loads a live map only on tap"). */
  @Column({ nullable: true })
  mapImage: string | null;

  /** Optional link opened when the map image is tapped. */
  @Column({ nullable: true })
  mapUrl: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  socialLinks: SocialLink[];

  /** Comp data-prop `heroLayout`. */
  @Column({ type: 'varchar', default: 'split' })
  heroLayout: 'split' | 'layered';

  @UpdateDateColumn()
  updatedAt: Date;
}
