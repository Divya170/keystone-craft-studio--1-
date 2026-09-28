import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/** Shop category ("Find your way into the studio"). Seeded as unpublished
 * drafts — the comp's names are placeholders until the studio confirms them. */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  /** Short descriptor under the name on the Home rail. */
  @Column({ nullable: true })
  description: string | null;

  @Column({ nullable: true })
  image: string | null;

  @Column({ nullable: true })
  imageAlt: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (p) => p.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
