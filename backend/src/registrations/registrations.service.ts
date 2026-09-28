import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { Workshop, WorkshopStatus } from '../workshops/entities/workshop.entity';
import { SubmitRegistrationDto, UpdateRegistrationDto } from './dto/registration.dto';
import { newReference, validateRegistration } from '../common/form-rules';
import { clean } from '../common/utils/unique-slug';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration) private readonly repo: Repository<Registration>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private fail(errors: Record<string, string>, message = 'Please check the highlighted fields.'): never {
    throw new BadRequestException({ message, errors });
  }

  /**
   * Validates exactly like the comp, then — inside one transaction so two
   * people can't take the last spot — checks the workshop is published, not
   * closed, and has room for the requested number of attendees.
   */
  async submit(dto: SubmitRegistrationDto) {
    const errors = validateRegistration(dto);
    const attendees = Number(dto.attendees || 1);
    if (!Number.isInteger(attendees) || attendees < 1 || attendees > 4) errors.attendees = 'Choose 1 to 4 people.';
    if (Object.keys(errors).length) this.fail(errors);

    return this.dataSource.transaction(async (m) => {
      const w = await m.getRepository(Workshop).findOne({ where: { id: dto.workshop, published: true } });
      if (!w) this.fail({ workshop: 'Choose a workshop.' });
      if (w.status === WorkshopStatus.CLOSED) this.fail({ workshop: 'Registration for this workshop is closed.' }, 'Registration for this workshop is closed.');
      if (w.capacity != null) {
        const raw = await m
          .getRepository(Registration)
          .createQueryBuilder('r')
          .select('COALESCE(SUM(r.attendees),0)', 'n')
          .where('r.workshopId = :id AND r.status != :c', { id: w.id, c: RegistrationStatus.CANCELLED })
          .getRawOne();
        const left = w.capacity - Number(raw?.n || 0);
        if (left <= 0) this.fail({ workshop: 'This workshop is full.' }, 'This workshop is full.');
        if (attendees > left) this.fail({ attendees: `Only ${left} spot${left === 1 ? '' : 's'} left.` });
      }
      const repo = m.getRepository(Registration);
      let reference = newReference('RG');
      while (await repo.findOne({ where: { reference } })) reference = newReference('RG');
      const saved = await repo.save(
        repo.create({
          reference,
          workshopId: w.id,
          workshopTitle: w.title,
          name: dto.name!.trim(),
          email: dto.email!.trim(),
          attendees,
          message: clean(dto.message),
          status: RegistrationStatus.NEW,
        }),
      );
      return { success: true, reference: saved.reference, name: saved.name, email: saved.email, workshopTitle: saved.workshopTitle, attendees };
    });
  }

  // ───────── Admin ─────────

  async findAll(opts: { status?: string; workshopId?: string; q?: string }) {
    const qb = this.repo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC');
    if (opts.status && opts.status !== 'all') qb.andWhere('r.status = :s', { s: opts.status });
    if (opts.workshopId) qb.andWhere('r.workshopId = :w', { w: opts.workshopId });
    const q = (opts.q || '').trim().toLowerCase();
    if (q) qb.andWhere('(LOWER(r.name) LIKE :q OR LOWER(r.email) LIKE :q OR LOWER(r.reference) LIKE :q OR LOWER(r.workshopTitle) LIKE :q)', { q: `%${q}%` });
    return qb.getMany();
  }

  countNew() {
    return this.repo.count({ where: { status: RegistrationStatus.NEW } });
  }

  recent(n = 5) {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: n });
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Registration not found.');
    return r;
  }

  async update(id: string, dto: UpdateRegistrationDto) {
    const r = await this.findOne(id);
    if (dto.status !== undefined) r.status = dto.status;
    if (dto.adminNotes !== undefined) r.adminNotes = clean(dto.adminNotes);
    return this.repo.save(r);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { success: true };
  }

  countActive() {
    return this.repo.count({ where: { status: Not(RegistrationStatus.CANCELLED) } });
  }
}
