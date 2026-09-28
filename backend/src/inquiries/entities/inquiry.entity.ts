import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum InquiryType {
  PRODUCT = 'product',
  WORKSHOP = 'workshop',
  GENERAL = 'general',
}

export enum InquiryStatus {
  NEW = 'new',
  RESPONDED = 'responded',
  ARCHIVED = 'archived',
}

/** "Send an inquiry" submissions (Home + Contact, and every "Ask About…" button). */
@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  reference: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  type: InquiryType;

  /** "Product or workshop" — pre-filled by Ask About buttons. */
  @Column({ nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: InquiryStatus.NEW })
  status: InquiryStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
