import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** The four statuses the comp allows ("Status shows only from real data"). */
export enum WorkshopStatus {
  OPEN = 'Registration Open',
  COMING_SOON = 'Coming Soon',
  CLOSED = 'Registration Closed',
  TBA = 'Date To Be Announced',
}

/**
 * A workshop. Date, duration, price, capacity and materials are optional and
 * only render when supplied. Seeded as unpublished drafts ("Workshop title
 * 01"… are placeholders) that keep the comp's photography.
 */
@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  /** List description — what participants make, and who it suits. */
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  /** Detail "What to expect". */
  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ nullable: true })
  image: string | null;

  @Column({ nullable: true })
  imageAlt: string | null;

  @Column({ type: 'varchar', default: WorkshopStatus.TBA })
  status: WorkshopStatus;

  /** ISO local date-time, e.g. 2026-10-18T10:00 */
  @Column({ nullable: true })
  startsAt: string | null;

  @Column({ nullable: true })
  duration: string | null;

  @Column({ type: 'real', nullable: true })
  price: number | null;

  /** Max attendees; null = unlimited / not supplied. */
  @Column({ type: 'integer', nullable: true })
  capacity: number | null;

  @Column({ type: 'text', nullable: true })
  materials: string | null;

  /** Null → the studio address is shown. */
  @Column({ nullable: true })
  location: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
