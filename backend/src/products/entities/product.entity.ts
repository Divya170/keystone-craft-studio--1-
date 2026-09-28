import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export interface ProductImage {
  url: string;
  alt: string;
  /** Short view label shown in the viewer, e.g. "Detail", "In use". */
  label?: string;
}

/** Optional stock badge — hidden on the site when not supplied. */
export enum Availability {
  AVAILABLE = 'Available',
  MADE_TO_ORDER = 'Made to order',
  SOLD = 'Sold',
}

/**
 * A handmade piece. The comp is inquiry-only ("items aren't sold online
 * yet"), so price, availability and materials are optional display fields
 * that render only when supplied. Starts empty — the comp's 12 products are
 * numbered placeholders.
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'real', nullable: true })
  price: number | null;

  @Column({ type: 'varchar', nullable: true })
  availability: Availability | null;

  @Column({ type: 'text', nullable: true })
  materials: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  images: ProductImage[];

  /** Home "Featured pieces" (first featured is the large tile). */
  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  published: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
