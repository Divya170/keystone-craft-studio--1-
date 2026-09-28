import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum RegistrationStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  WAITLISTED = 'waitlisted',
  CANCELLED = 'cancelled',
}

/** A workshop registration request (the comp's 4-field form). The studio
 * replies by email with dates and details, then sets the status here. */
@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  reference: string;

  @Column({ type: 'varchar', nullable: true })
  workshopId: string | null;

  /** Snapshot so the record stays readable if the workshop is renamed/deleted. */
  @Column()
  workshopTitle: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'integer', default: 1 })
  attendees: number;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', default: RegistrationStatus.NEW })
  status: RegistrationStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
